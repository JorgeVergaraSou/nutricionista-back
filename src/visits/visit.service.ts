// src/visits/visit.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import * as fs from 'fs';

// ENTITIES
import { VisitEntity } from './entities/visit.entity';
import { PatientEntity } from '@/patients/entities/patient.entity';
import { TurnoEntity } from '@/turnos/entities/turno.entity';
import { AnthropometricEntity } from '@/patients/entities/anthropometric.entity';
import { PatientFileEntity } from '@/patient-files/entities/patient-file.entity';
import { PrescriptionEntity } from '@/patients/entities/prescription.entity';
import { Bioanalysis } from '@/patients/entities/bioanalysis.entity';
import { BioanalysisItem } from '@/patients/entities/bioanalysis-item.entity';

// ENUMS
import { EstadoTurno } from '@/common/enums/estado-turno.enum';


// DTOs
import { UpdateVisitDto } from './dto/update-visit.dto';
import { CreateFullVisitDto } from './dto/create-full-visit.dto';
import { VisitResponseDto } from './dto/visit-response.dto';
import { CreateVisitDto } from './dto/create-visit.dto';

@Injectable()
export class VisitsService {
  constructor(
  @InjectRepository(VisitEntity)
  private readonly visitRepo: Repository<VisitEntity>,

  @InjectRepository(PatientEntity)
  private readonly patientRepo: Repository<PatientEntity>,

  @InjectRepository(TurnoEntity)
  private readonly turnoRepo: Repository<TurnoEntity>,

  @InjectRepository(AnthropometricEntity)
  private readonly anthropometricRepo: Repository<AnthropometricEntity>,

  @InjectRepository(PatientFileEntity)
private patientFileRepo: Repository<PatientFileEntity>,

  private readonly dataSource: DataSource,
) {}

  // --------------------------------------------------
  // 🆕 Crear visita (acto médico real)
  // --------------------------------------------------

async createFullVisit(dto: CreateFullVisitDto,files: Express.Multer.File[],) {
   console.log("DTO COMPLETO:", JSON.stringify(dto, null, 2));
  return this.dataSource.transaction(async (manager) => {
    const patient = await manager.findOne(PatientEntity, {
      where: { id: dto.patientId },
    });

    if (!patient) {
      throw new NotFoundException('Paciente no encontrado');
    }

    let turno: TurnoEntity | null = null;

    if (dto.turnoId) {
      turno = await manager.findOne(TurnoEntity, {
        where: { id: dto.turnoId },
        relations: ['visita'],
      });

      if (!turno) throw new NotFoundException('Turno no encontrado');

      if (turno.visita) {
        throw new BadRequestException('Este turno ya tiene una visita');
      }
    }

    // ----------------------------
    // VISITA
    // ----------------------------
    const visit = manager.create(VisitEntity, {
      paciente: patient,
      turno: turno ?? undefined,
      motivoConsulta: dto.motivoConsulta,
      enfermedadActual: dto.enfermedadActual ?? null,
      examenFisico: dto.examenFisico ?? null,
      diagnostico: dto.diagnostico ?? null,
      planTratamiento: dto.planTratamiento ?? null,
      evolucion: dto.evolucion ?? null,
      observaciones: dto.observaciones ?? null,
    });

    const savedVisit = await manager.save(visit);

    // ----------------------------
    // ANTROPOMETRIA
    // ----------------------------
    if (dto.antropometria) {
      const { peso, talla } = dto.antropometria;

      let imc: number | null = null;

      if (peso != null && talla != null) {
        imc = peso / (talla * talla);
      }

      const antropometria = manager.create(AnthropometricEntity, {
        fecha: new Date(),
        ...dto.antropometria,
        imc,
        patient,
        visita: savedVisit,
      });

      await manager.save(antropometria);
    }

    // ----------------------------
    // PRESCRIPCIONES
    // ----------------------------
    if (dto.prescripciones?.length) {
      const prescripciones = dto.prescripciones.map((p) =>
        manager.create(PrescriptionEntity, {
          medicamento: p.medicamento,
          dosis: p.dosis,
          intervalo: p.intervalo,
          fechaInicio: p.fechaInicio ?? null,
          fechaFin: p.fechaFin ?? null,
          patient,
          visita: savedVisit,
        }),
      );

      await manager.save(prescripciones);
    }

    // ----------------------------
    // ANALISIS
    // ----------------------------
    if (dto.analisisBioquimicos?.length) {
      for (const a of dto.analisisBioquimicos) {

             // ✅ LOG #3 (ya te lo había dicho)
    console.log("ANALISIS INDIVIDUAL:", a);

    // 🔥 LOG #4 (EL DEFINITIVO)
    console.log("ITEMS DEL ANALISIS:", a.items);

    // 🔥 LOG #5 (CRÍTICO)
    console.log("a.items?.length:", a.items?.length);

        const bio = await manager.save(
          manager.create(Bioanalysis, {
            tipo: a.tipo,
            resultados: a.resultados ?? null,
            fecha: new Date(),
            patient,
            visita: savedVisit,
          }),
        );

        if (a.items?.length) {
          const items = a.items.map((i) => {


            return manager.create(BioanalysisItem, {
              ...i,
            
              analysis: bio,
            });
          });

          await manager.save(items);
        }
      }
    }

    // ----------------------------
    // ARCHIVOS
    // ----------------------------
    if (files?.length) {
      const uploadPath = `./uploads/patients/${patient.id}`;
      await fs.promises.mkdir(uploadPath, { recursive: true });

      for (const file of files) {
        const newPath = `${uploadPath}/${file.filename}`;

        await fs.promises.rename(file.path, newPath);

        const fileEntity = manager.create(PatientFileEntity, {
          filename: file.filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          storagePath: newPath,
          size: file.size,
          patient,
          visit: savedVisit,
        });

        await manager.save(fileEntity);
      }
    }

    // ----------------------------
    // TURNO
    // ----------------------------
    if (turno) {
      turno.estado = EstadoTurno.ATENDIDO;
      await manager.save(turno);
    }

    return manager.findOne(VisitEntity, {
      where: { id: savedVisit.id },
      relations: [
        'paciente',
        'turno',
        'medicionesAntropometricas',
        'files',
        'prescripciones',
        'analisisBioquimicos',
        'analisisBioquimicos.items',
      ],
    });
  });
}

/** crear visita simple */
async create(dto: CreateVisitDto) {
  const patient = await this.patientRepo.findOne({
    where: { id: dto.patientId },
  });

  if (!patient) {
    throw new NotFoundException('Paciente no encontrado');
  }

  let turno: TurnoEntity | null = null;

  if (dto.turnoId) {
    turno = await this.turnoRepo.findOne({
      where: { id: dto.turnoId },
      relations: ['visita'],
    });

    if (!turno) {
      throw new NotFoundException('Turno no encontrado');
    }

    if (turno.visita) {
      throw new BadRequestException('El turno ya tiene una visita');
    }
  }

  const visit = this.visitRepo.create({
    paciente: patient,
    turno: turno ?? undefined,
    fecha: dto.fecha ?? new Date(),
    motivoConsulta: dto.motivoConsulta ?? null,
    observaciones: dto.observaciones ?? null,
    planTratamiento: dto.planTratamiento ?? null,
    evolucion: dto.evolucion ?? null,
  });

  const saved = await this.visitRepo.save(visit);

  // marcar turno como atendido
  if (turno) {
    turno.estado = EstadoTurno.ATENDIDO;
    await this.turnoRepo.save(turno);
  }

  return saved;
}

// --------------------------------------------------
// 📋 Historial clínico del paciente (PRO)
// --------------------------------------------------
async findByPatient(patientId: number): Promise<VisitResponseDto[]> {
  const paciente = await this.patientRepo.findOne({
    where: { id: patientId },
  });

  if (!paciente) {
    throw new NotFoundException('Paciente no encontrado');
  }

  const visitas = await this.visitRepo.find({
    where: { paciente: { id: patientId } },
    relations: [
      'turno',
      'medicionesAntropometricas',
      'analisisBioquimicos',
      'analisisBioquimicos.items',
      'prescripciones',
      'files',
    ],
    order: { fecha: 'DESC' },
  });

  return visitas.map((v) => ({
    id: v.id,
    fecha: v.fecha,

    motivoConsulta: v.motivoConsulta,
    enfermedadActual: v.enfermedadActual,
    examenFisico: v.examenFisico,
    diagnostico: v.diagnostico,
    planTratamiento: v.planTratamiento,
    evolucion: v.evolucion,
    observaciones: v.observaciones,

    turno: v.turno
      ? {
          id: v.turno.id,
          fecha: v.turno.fecha,
          hora: v.turno.hora,
        }
      : null,

    medicionesAntropometricas:
      v.medicionesAntropometricas?.map((a) => ({
        id: a.id,
        peso: a.peso,
        talla: a.talla,
        imc: a.imc,
      })) ?? [],

analisisBioquimicos:
  v.analisisBioquimicos?.map((a) => ({
    id: a.id,
    tipo: a.tipo,
    resultados: a.resultados,
    items: a.items ?? [], // 🔥 FUTURO FRONTEND
  })) ?? [],

    prescripciones:
      v.prescripciones?.map((p) => ({
        id: p.id,
        nombre: p.medicamento,
        indicaciones: p.intervalo,
      })) ?? [],

    files:
      v.files?.map((f) => ({
        id: f.id,
        originalName: f.originalName,
        storagePath: f.storagePath,
        size: f.size,
        mimeType: f.mimeType,
      })) ?? [],
  }));
}




  // --------------------------------------------------
  // ✏️ Actualizar visita (nota clínica)
  // --------------------------------------------------
  async update(id: number, dto: UpdateVisitDto) {
    const visita = await this.visitRepo.findOne({
      where: { id },
    });

    if (!visita) {
      throw new NotFoundException('Visita no encontrada');
    }

    Object.assign(visita, {
      motivoConsulta: dto.motivoConsulta ?? visita.motivoConsulta,
      observaciones: dto.observaciones ?? visita.observaciones,
      planTratamiento:
        dto.planTratamiento ?? visita.planTratamiento,
      evolucion: dto.evolucion ?? visita.evolucion,
    });

    return this.visitRepo.save(visita);
  }
}
