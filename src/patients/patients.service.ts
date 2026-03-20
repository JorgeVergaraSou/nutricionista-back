//src/patients/patients.service.ts
import {
  Injectable,
  HttpException,
  HttpStatus,
  NotFoundException,
  Inject,
  LoggerService,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import { PatientEntity } from './entities/patient.entity';
import { Antecedent } from './entities/antecedent.entity';
import { Bioanalysis } from './entities/bioanalysis.entity';
import { AnthropometricEntity } from './entities/anthropometric.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { CreateAntecedentDto } from './dto/create-antecedent.dto';
import { CreateBioanalysisDto } from './dto/create-bioanalysis.dto';
import { CreateAnthropometricDto } from './dto/create-anthropometric.dto';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { handleServiceError } from '@/common/utils/error-handler.util';
import { deleteLogger, insertLogger, selectLogger, updateLogger } from '@/config/db-loggers';
import { CreateFullPatientDto } from './dto/create-full-patient.dto';
import { VisitEntity } from '@/visits/entities/visit.entity';


import { PrescriptionEntity } from './entities/prescription.entity';
import { PatientFileEntity } from '@/patient-files/entities/patient-file.entity';
import { ClinicalHistoryItemDto } from './dto/clinical-history.dto';
import { BioanalysisItem } from './entities/bioanalysis-item.entity';
import { EstadoAnalisis } from '@/common/enums/estado_analisis';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(PatientEntity)
    private readonly patientsRepo: Repository<PatientEntity>,

    @InjectRepository(Antecedent)
    private readonly antecedentRepo: Repository<Antecedent>,

    @InjectRepository(Bioanalysis)
    private readonly bioRepo: Repository<Bioanalysis>,

    @InjectRepository(AnthropometricEntity)
    private readonly anthropometricRepo: Repository<AnthropometricEntity>,

    @InjectRepository(VisitEntity)
    private readonly visitRepo: Repository<VisitEntity>,

    @InjectRepository(PatientEntity)
    private patientRepo: Repository<PatientEntity>,

    @InjectRepository(BioanalysisItem)
    private bioItemRepo: Repository<BioanalysisItem>,


    @InjectRepository(PrescriptionEntity)
    private prescriptionRepo: Repository<PrescriptionEntity>,

    @InjectRepository(PatientFileEntity)
    private fileRepo: Repository<PatientFileEntity>,


    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) { }

  // 🩺 Crear nuevo paciente
  async createPatient(dto: CreatePatientDto): Promise<{ success: boolean; message: string }> {
    try {
      const exists = await this.patientsRepo.findOne({ where: { dni: dto.dni } });
      if (exists) {
        throw new HttpException('DNI ya registrado', HttpStatus.CONFLICT);
      }

      const newPatient = this.patientsRepo.create(dto);
      const saved = await this.patientsRepo.save(newPatient);

      insertLogger.info(
        `Paciente creado: ${JSON.stringify({
          id: saved.id,
          nombre: saved.nombre,
          dni: saved.dni,
          telefono: saved.telefono,
          email: saved.email,
        })}`,
      );

      return { success: true, message: 'Paciente creado exitosamente' };
    } catch (error) {
      handleServiceError(error, this.logger, 'createPatient', 'Ocurrió un error al crear el paciente');
    }
  }

  // 🔍 Obtener paciente (devuelve entidad)

  async getPatient(id: number): Promise<PatientEntity> {
    try {
      const patient = await this.patientsRepo.findOne({
        where: { id },
        relations: [
          'antecedentes',
          'visitas',
          'visitas.medicionesAntropometricas',
          'visitas.analisisBioquimicos',
          'visitas.prescripciones',
          'visitas.files',
          'visitas.turno',
          'turnos',
        ],
        order: {
          visitas: {
            id: 'DESC',
          },
        },
      });

      if (!patient)
        throw new NotFoundException('Paciente no encontrado');

      return patient;
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'getPatient',
        'Ocurrió un error al obtener el paciente',
      );
    }
  }

  //Autocomplete
  async autocompletePatients(
    term: string,
    page = 1,
    limit = 10,
  ): Promise<{ success: boolean; data: any[]; total: number }> {
    try {
      if (!term || term.trim() === '') {
        return { success: true, data: [], total: 0 };
      }

      const skip = (page - 1) * limit;

      // 🔍 Búsqueda rápida (solo campos necesarios)
      const [patients, total] = await this.patientsRepo.findAndCount({
        where: [
          { nombre: ILike(`%${term}%`) },
          { apellido: ILike(`%${term}%`) },
          { dni: ILike(`%${term}%`) },
        ],
        select: ['id', 'nombre', 'apellido', 'dni'],
        order: { nombre: 'ASC' },
        take: limit,
        skip,
      });

      // 🧾 Log para auditoría (solo cuando hay resultados)
      if (patients.length > 0) {
        selectLogger.info(
          `Autocomplete pacientes: término="${term}", resultados=${patients.length}`,
        );
      }

      return {
        success: true,
        data: patients,
        total,
      };
    } catch (error) {
      handleServiceError(error, this.logger, 'autocompletePatients', 'Error en autocompletado de pacientes');
    }
  }

  //AUTOCOMPLETE FIN

  /** CREAR PACIENTE */
  async createFullPatient(dto: CreateFullPatientDto) {
    const queryRunner =
      this.patientsRepo.manager.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      /* 1️⃣ Validar DNI */
      const exists = await queryRunner.manager.findOne(PatientEntity, {
        where: { dni: dto.dni },
      });

      if (exists) {
        throw new HttpException(
          'DNI ya registrado',
          HttpStatus.CONFLICT,
        );
      }

      /* 2️⃣ Crear paciente */
      const patient = queryRunner.manager.create(PatientEntity, {
        nombre: dto.nombre,
        apellido: dto.apellido,
        dni: dto.dni,
        fechaNacimiento: dto.fechaNacimiento,
        direccion: dto.direccion,
        telefono: dto.telefono,
        email: dto.email,
        actividadFisica: dto.actividadFisica,
      });

      await queryRunner.manager.save(patient);

      /* 3️⃣ Relaciones directas al paciente */

      if (dto.antecedentes?.length) {
        const antecedents = dto.antecedentes.map((a) =>
          queryRunner.manager.create(Antecedent, {
            ...a,
            patient,
          }),
        );
        await queryRunner.manager.save(antecedents);
      }

      if (dto.analisisBioquimicos?.length) {
        const bios = dto.analisisBioquimicos.map((b) =>
          queryRunner.manager.create(Bioanalysis, {
            ...b,
            patient,
          }),
        );
        await queryRunner.manager.save(bios);
      }

      if (dto.medicionesAntropometricas?.length) {
        const ants = dto.medicionesAntropometricas.map((a) =>
          queryRunner.manager.create(AnthropometricEntity, {
            ...a,
            patient,
          }),
        );
        await queryRunner.manager.save(ants);
      }

      /* 4️⃣ VISITAS (NUEVO 🔥) */

      if (dto.visitas?.length) {
        for (const visitaDto of dto.visitas) {
          const visit = queryRunner.manager.create(VisitEntity, {
            motivoConsulta: visitaDto.motivoConsulta ?? null,
            enfermedadActual: visitaDto.enfermedadActual ?? null,
            examenFisico: visitaDto.examenFisico ?? null,
            diagnostico: visitaDto.diagnostico ?? null,
            planTratamiento: visitaDto.planTratamiento ?? null,
            evolucion: visitaDto.evolucion ?? null,
            observaciones: visitaDto.observaciones ?? null,
            paciente: patient,
          });

          const savedVisit = await queryRunner.manager.save(visit);

          /* Antropometría asociada a visita */
          if (visitaDto.medicionesAntropometricas?.length) {
            const ants = visitaDto.medicionesAntropometricas.map(
              (a) =>
                queryRunner.manager.create(
                  AnthropometricEntity,
                  {
                    ...a,
                    visita: savedVisit,
                    patient,
                  },
                ),
            );
            await queryRunner.manager.save(ants);
          }

          /* Bioanálisis asociado a visita */
          if (visitaDto.analisisBioquimicos?.length) {
            const bios = visitaDto.analisisBioquimicos.map(
              (b) =>
                queryRunner.manager.create(Bioanalysis, {
                  ...b,
                  visita: savedVisit,
                  patient,
                }),
            );
            await queryRunner.manager.save(bios);
          }
        }
      }

      await queryRunner.commitTransaction();

      return {
        success: true,
        message:
          'Paciente registrado correctamente con sus datos y visitas',
        data: patient,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
  /** FIN CREAR PACIENTE */

  /** HISTORIA CLINICA */
  async getClinicalHistory(
    patientId: number,
  ): Promise<ClinicalHistoryItemDto[]> {

    const patient = await this.patientRepo.findOne({
      where: { id: patientId },
    });

    if (!patient) {
      throw new NotFoundException('Paciente no encontrado');
    }

    const visits = await this.visitRepo.find({
      where: { paciente: { id: patientId } },
      relations: [
        'turno',
        'medicionesAntropometricas',
        'analisisBioquimicos',
        'prescripciones',
        'files',
      ],
      order: {
        fecha: 'DESC',
      },
    });

    const history: ClinicalHistoryItemDto[] = [];

    for (const v of visits) {
      // -----------------------
      // VISITA
      // -----------------------

      history.push({
        fecha: v.fecha,
        tipo: 'VISITA',
        data: {
          id: v.id,
          motivoConsulta: v.motivoConsulta,
          diagnostico: v.diagnostico,
          planTratamiento: v.planTratamiento,
          evolucion: v.evolucion,
          observaciones: v.observaciones,
          turno: v.turno
            ? {
              fecha: v.turno.fecha,
              hora: v.turno.hora,
            }
            : null,
        },
      });

      // -----------------------
      // ANTROPOMETRIA
      // -----------------------

      v.medicionesAntropometricas?.forEach((a) => {
        if (!a.fecha) return;

        history.push({
          fecha: a.fecha,
          tipo: 'ANTROPOMETRIA',
          data: {
            peso: a.peso,
            talla: a.talla,
            imc: a.imc,
            circAbdominal: a.circAbdominal,
            porcentajeGrasa: a.porcentajeGrasa,
            porcentajeGrasaABD: a.porcentajeGrasaABD,
            porcentajeMusculo: a.porcentajeMusculo,
            kcalBasales: a.kcalBasales,
          },
        });
      });

      // -----------------------
      // ANALISIS
      // -----------------------

      v.analisisBioquimicos?.forEach((a) => {
        if (!a.fecha) return;

        history.push({
          fecha: new Date(a.fecha),
          tipo: 'ANALISIS',
          data: {
            tipo: a.tipo,
            resultados: a.resultados,
            items: a.items ?? [], // 🔥 CLAVE
          },
        });
      });

      // -----------------------
      // PRESCRIPCIONES
      // -----------------------

      v.prescripciones?.forEach((p) => {
        if (!p.fechaInicio) return;

        history.push({
          fecha: p.fechaInicio,
          tipo: 'PRESCRIPCION',
          data: {
            medicamento: p.medicamento,
            dosis: p.dosis,
            intervalo: p.intervalo,
            activa: p.activa,
            fechaFin: p.fechaFin,
          },
        });
      });

      // -----------------------
      // ARCHIVOS
      // -----------------------

      v.files?.forEach((f) => {
        history.push({
          fecha: f.uploadedAt,
          tipo: 'ARCHIVO',
          data: {
            nombre: f.originalName,
            path: f.storagePath.replace(/^\.?\/?uploads\//, ''), // 🔥 opcional pero recomendado
            mimeType: f.mimeType, // 🔥 CLAVE
            size: f.size,
          },
        });
      });
    }

    // -----------------------
    // ORDEN GLOBAL
    // -----------------------

    history.sort(
      (a, b) =>
        new Date(b.fecha).getTime() -
        new Date(a.fecha).getTime(),
    );
    console.log('Historia clínica generada para paciente ID', patientId, history);
    return history;
  }

  /** FIN HISTORIA CLINICA */

  // 🔎 Buscar pacientes con paginación
  async searchPatients(query: string, page = 1, limit = 10) {
    try {
      const [data, total] = await this.patientsRepo.findAndCount({
        where: query
          ? [{ nombre: Like(`%${query}%`) }, { dni: Like(`%${query}%`) }]
          : {},
        order: { nombre: 'ASC' },
        skip: (page - 1) * limit,
        take: limit,
      });

      return {
        success: true,
        message: 'Pacientes obtenidos correctamente',
        data,
        pagination: { total, page, limit },
      };
    } catch (error) {
      handleServiceError(error, this.logger, 'searchPatients', 'Error al listar pacientes');
    }
  }

  // ✏️ Actualizar paciente
  async updatePatient(id: number, dto: UpdatePatientDto) {
    try {
      const patient = await this.getPatient(id);
      if (!patient) throw new NotFoundException('Paciente no encontrado');

      const updated = Object.assign(patient, dto);
      await this.patientsRepo.save(updated);

      updateLogger.info(
        `Paciente actualizado: ${JSON.stringify({
          id: patient.id,
          nombre: patient.nombre,
          dni: patient.dni,
        })}`,
      );

      return { success: true, message: 'Paciente actualizado correctamente' };
    } catch (error) {
      handleServiceError(error, this.logger, 'updatePatient', 'Error al actualizar paciente');
    }
  }

  // ❌ Eliminar paciente
  async deletePatient(id: number) {
    try {
      const result = await this.patientsRepo.softDelete(id);
      if (result.affected === 0) throw new NotFoundException('Paciente no encontrado');

      deleteLogger.info(`Paciente eliminado: ID ${id}`);

      return { success: true, message: 'Paciente eliminado correctamente' };
    } catch (error) {
      handleServiceError(error, this.logger, 'deletePatient', 'Error al eliminar paciente');
    }
  }

  // --- CRUD Antecedentes ---
  async createAntecedent(patientId: number, dto: CreateAntecedentDto) {
    try {
      const patient = await this.getPatient(patientId);

      const antecedent = this.antecedentRepo.create({
        ...dto,
        activo: true,
        patient,
      });

      const saved = await this.antecedentRepo.save(antecedent);

      insertLogger.info(
        `Antecedente creado para paciente ${patientId}: ${JSON.stringify({
          tipo: dto.tipo,
          titulo: dto.titulo,
          fechaEvento: dto.fechaEvento,
        })}`,
      );

      return {
        success: true,
        message: 'Antecedente registrado correctamente',
        data: saved,
      };

    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'createAntecedent',
        'Error al crear antecedente',
      );
    }
  }

  async deleteAntecedent(id: number) {
    try {
      const antecedent = await this.antecedentRepo.findOne({
        where: { id },
      });

      if (!antecedent) {
        throw new NotFoundException('Antecedente no encontrado');
      }

      antecedent.activo = false;

      await this.antecedentRepo.save(antecedent);

      deleteLogger.info(`Antecedente desactivado: ID ${id}`);

      return {
        success: true,
        message: 'Antecedente marcado como inactivo',
      };

    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'deleteAntecedent',
        'Error al desactivar antecedente',
      );
    }
  }





  // --- Bioanalysis ---
  async createBioanalysis(patientId: number, dto: CreateBioanalysisDto) {
    try {
      const patient = await this.getPatient(patientId);

      // ✅ crear entidad manual (PRO)
      const bio = new Bioanalysis();
      bio.tipo = dto.tipo;
      bio.resultados = dto.resultados ?? null;
      bio.fecha = dto.fecha ? new Date(dto.fecha) : null;
      bio.patient = patient;

      const savedBio = await this.bioRepo.save(bio);

      // 🔥 ITEMS PRO (sin create())
      if (dto.items && dto.items.length > 0) {
        const items: BioanalysisItem[] = dto.items.map((i) => {
          let estado: EstadoAnalisis = EstadoAnalisis.SIN_REFERENCIA;

          if (
            i.valor !== undefined &&
            i.valorMin !== undefined &&
            i.valorMax !== undefined
          ) {
            if (i.valor < i.valorMin) estado = EstadoAnalisis.BAJO;
            else if (i.valor > i.valorMax) estado = EstadoAnalisis.ALTO;
            else estado = EstadoAnalisis.NORMAL;
          }

          const item = new BioanalysisItem();
          item.nombre = i.nombre;
          item.valor = i.valor ?? null;
          item.unidad = i.unidad ?? null;
          item.valorMin = i.valorMin ?? null;
          item.valorMax = i.valorMax ?? null;
          item.estado = estado;
          item.analysis = savedBio;

          return item;
        });

        await this.bioItemRepo.save(items);
      }

      return await this.bioRepo.findOne({
        where: { id: savedBio.id },
        relations: ['items'],
      });
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'createBioanalysis',
        'Error al crear análisis bioquímico',
      );
    }
  }

  async deleteBioanalysis(id: number) {
    try {
      const res = await this.bioRepo.delete(id);
      if (res.affected === 0) throw new NotFoundException('Análisis bioquímico no encontrado');
      deleteLogger.info(`Análisis bioquímico eliminado: ID ${id}`);
      return { success: true };
    } catch (error) {
      handleServiceError(error, this.logger, 'deleteBioanalysis', 'Error al eliminar análisis bioquímico');
    }
  }

  // --- Anthropometrics ---
  async createAnthropometric(
    patientId: number,
    dto: CreateAnthropometricDto,
  ) {
    try {
      const patient = await this.getPatient(patientId);

      let visit = null;

      if (dto.visitId) {
        visit = await this.visitRepo.findOne({
          where: { id: dto.visitId },
        });

        if (!visit) {
          throw new NotFoundException('Visita no encontrada');
        }
      }

      const record = this.anthropometricRepo.create({
        ...dto,
        patient,
        visita: visit,
      });

      return await this.anthropometricRepo.save(record);

    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'createAnthropometric',
        'Error al crear antropometría',
      );
    }
  }


  async deleteAnthropometric(id: number) {
    try {
      const record = await this.anthropometricRepo.findOne({ where: { id } });

      if (!record) {
        throw new NotFoundException('Registro antropométrico no encontrado');
      }

      await this.anthropometricRepo.softDelete(id);

      this.logger.log(`Registro antropométrico eliminado: ID ${id}`);

      return { success: true, message: 'Registro antropométrico eliminado correctamente' };
    } catch (error) {
      handleServiceError(error, this.logger, 'deleteAnthropometric', 'Error al eliminar registro antropométrico');
    }
  }

}
