// src/visits/visit.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { VisitEntity } from './entities/visit.entity';
import { PatientEntity } from '@/patients/entities/patient.entity';
import { TurnoEntity } from '@/turnos/entities/turno.entity';

import { CreateVisitDto } from './dto/create-visit.dto';
import { UpdateVisitDto } from './dto/update-visit.dto';
import { AnthropometricEntity } from '@/patients/entities/anthropometric.entity';
import { CreateFullVisitDto } from './dto/create-full-visit.dto';

@Injectable()
export class VisitsService {
  constructor(
    @InjectRepository(VisitEntity)
    private readonly visitRepo: Repository<VisitEntity>,

    @InjectRepository(PatientEntity)
    private readonly patientRepo: Repository<PatientEntity>,

    @InjectRepository(TurnoEntity)
    private readonly turnoRepo: Repository<TurnoEntity>,

    private readonly dataSource: DataSource,
  ) {}

  // --------------------------------------------------
  // 🆕 Crear visita (acto médico real)
  // --------------------------------------------------
  async create(dto: CreateVisitDto) {
  const paciente = await this.patientRepo.findOne({
    where: { id: dto.patientId },
  });

  if (!paciente) {
    throw new NotFoundException('Paciente no encontrado');
  }

  let turno: TurnoEntity | null = null;

  if (dto.turnoId) {
    turno = await this.turnoRepo.findOne({
      where: { id: dto.turnoId },
      relations: ['paciente'],
    });

    if (!turno) {
      throw new NotFoundException('Turno no encontrado');
    }

    if (turno.paciente.id !== paciente.id) {
      throw new BadRequestException(
        'El turno no pertenece al paciente',
      );
    }

    const visitaExistente = await this.visitRepo.findOne({
      where: { turno: { id: turno.id } },
    });

    if (visitaExistente) {
      throw new BadRequestException(
        'Este turno ya tiene una visita registrada',
      );
    }
  }

  // ✅ FORMA CORRECTA (sin errores de TS)
  const visita = new VisitEntity();
  visita.paciente = paciente;
  visita.turno = turno;
  visita.fecha = dto.fecha;
  visita.motivoConsulta = dto.motivoConsulta ?? null;
  visita.observaciones = dto.observaciones ?? null;
  visita.planTratamiento = dto.planTratamiento ?? null;
  visita.evolucion = dto.evolucion ?? null;

  return this.visitRepo.save(visita);
}

async createFullVisit(dto: CreateFullVisitDto) {
  return this.dataSource.transaction(async (manager) => {

    const patient = await manager.findOne(PatientEntity, {
      where: { id: dto.patientId },
    });

    if (!patient) {
      throw new NotFoundException('Paciente no encontrado');
    }

    const visit = manager.create(VisitEntity, {
      fecha: new Date(),
      paciente: patient,
      motivoConsulta: dto.motivoConsulta ?? null,
      observaciones: dto.observaciones ?? null,
      planTratamiento: dto.planTratamiento ?? null,
      evolucion: dto.evolucion ?? null,
    });

    const savedVisit = await manager.save(visit);

    if (dto.antropometria) {
      const { peso, talla } = dto.antropometria;

      if (peso > 0 && talla > 0) {
        const imc = peso / (talla * talla);

        const anthropometric = manager.create(AnthropometricEntity, {
          fecha: new Date(),
          peso,
          talla,
          imc,
          paciente: patient,
          visita: savedVisit,
        });

        await manager.save(anthropometric);
      }
    }

    return savedVisit;
  });
}




  // --------------------------------------------------
  // 📋 Historial clínico del paciente
  // --------------------------------------------------
  async findByPatient(patientId: number) {
    const paciente = await this.patientRepo.findOne({
      where: { id: patientId },
    });

    if (!paciente) {
      throw new NotFoundException('Paciente no encontrado');
    }

    return this.visitRepo.find({
      where: { paciente: { id: patientId } },
      relations: [
        'turno',
        'medicionesAntropometricas',
        'analisisBioquimicos',
      ],
      order: { fecha: 'DESC' },
    });
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
