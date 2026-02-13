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
import { Medication } from './entities/medication.entity';
import { Bioanalysis } from './entities/bioanalysis.entity';
import { AnthropometricEntity } from './entities/anthropometric.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { CreateAntecedentDto } from './dto/create-antecedent.dto';
import { CreateMedicationDto } from './dto/create-medication.dto';
import { CreateBioanalysisDto } from './dto/create-bioanalysis.dto';
import { CreateAnthropometricDto } from './dto/create-anthropometric.dto';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { handleServiceError } from '@/common/utils/error-handler.util';
import { deleteLogger, insertLogger, selectLogger, updateLogger } from '@/config/db-loggers';
import { CreateFullPatientDto } from './dto/create-full-patient.dto';
import { VisitEntity } from '@/visits/entities/visit.entity';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(PatientEntity)
    private readonly patientsRepo: Repository<PatientEntity>,

    @InjectRepository(Antecedent)
    private readonly antecedentRepo: Repository<Antecedent>,

    @InjectRepository(Medication)
    private readonly medicationRepo: Repository<Medication>,

    @InjectRepository(Bioanalysis)
    private readonly bioRepo: Repository<Bioanalysis>,

    @InjectRepository(AnthropometricEntity)
    private readonly anthropometricRepo: Repository<AnthropometricEntity>,

    @InjectRepository(VisitEntity)
    private readonly visitRepo: Repository<VisitEntity>,


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
          'medicaciones',
          'analisisBioquimicos',
          'medicionesAntropometricas',
        ],
      });

      if (!patient) throw new NotFoundException('Paciente no encontrado');

      selectLogger.info(
        `Paciente consultado: ${JSON.stringify({
          id: patient.id,
          nombre: patient.nombre,
          dni: patient.dni,
        })}`,
      );

      return patient;
    } catch (error) {
      handleServiceError(error, this.logger, 'getPatient', 'Ocurrió un error al obtener el paciente');
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
        select: ['id', 'nombre', 'dni'],
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


  async createFullPatient(dto: CreateFullPatientDto) {
    const queryRunner = this.patientsRepo.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1️⃣ Crear paciente
      const exists = await queryRunner.manager.findOne(PatientEntity, {
        where: { dni: dto.dni },
      });
      if (exists) throw new HttpException('DNI ya registrado', HttpStatus.CONFLICT);

      const patient = queryRunner.manager.create(PatientEntity, dto);
      await queryRunner.manager.save(patient);

      // 2️⃣ Crear relaciones si existen
      if (dto.antecedentes?.length) {
        const antecedents = dto.antecedentes.map((a) =>
          queryRunner.manager.create(Antecedent, { ...a, patient }),
        );
        await queryRunner.manager.save(antecedents);
      }

      if (dto.medicaciones?.length) {
        const meds = dto.medicaciones.map((m) =>
          queryRunner.manager.create(Medication, { ...m, patient }),
        );
        await queryRunner.manager.save(meds);
      }

      if (dto.analisisBioquimicos?.length) {
        const bios = dto.analisisBioquimicos.map((b) =>
          queryRunner.manager.create(Bioanalysis, { ...b, patient }),
        );
        await queryRunner.manager.save(bios);
      }

      if (dto.medicionesAntropometricas?.length) {
        const ants = dto.medicionesAntropometricas.map((a) =>
          queryRunner.manager.create(AnthropometricEntity, { ...a, patient }),
        );
        await queryRunner.manager.save(ants);
      }

      await queryRunner.commitTransaction();

      insertLogger.info(
        `Paciente completo creado: ${JSON.stringify({
          id: patient.id,
          nombre: patient.nombre,
          dni: patient.dni,
        })}`,
      );

      return { success: true, message: 'Paciente registrado con todos sus datos', data: patient };
    } catch (err) {
      const error = err as Error;

      console.error("❌ ERROR REAL createFullPatient:", error);
      console.error("❌ ERROR MESSAGE:", error.message);
      console.error("❌ ERROR STACK:", error.stack);

      await queryRunner.rollbackTransaction();
      handleServiceError(error, this.logger, 'createFullPatient', 'Error al registrar paciente completo');
    } finally {
      await queryRunner.release();
    }
  }


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
      const antecedent = this.antecedentRepo.create({ ...dto, patient });

      insertLogger.info(
        `Antecedente creado para paciente ID ${patientId}: ${JSON.stringify({
          tipo: dto.tipo,
          descripcion: dto.descripcion,
        })}`,
      )
      return await this.antecedentRepo.save(antecedent);
    } catch (error) {
      handleServiceError(error, this.logger, 'createAntecedent', 'Error al crear antecedente');
    }
  }

  async deleteAntecedent(id: number) {
    try {
      const res = await this.antecedentRepo.delete(id);
      if (res.affected === 0) throw new NotFoundException('Antecedente no encontrado');
      deleteLogger.info(`Antecedente eliminado: ID ${id}`);
      return { success: true };
    } catch (error) {
      handleServiceError(error, this.logger, 'deleteAntecedent', 'Error al eliminar antecedente');
    }
  }

  // --- Medications ---
  async createMedication(patientId: number, dto: CreateMedicationDto) {
    try {
      const patient = await this.getPatient(patientId);
      const medication = this.medicationRepo.create({ ...dto, patient });
      insertLogger.info(
        `Medicación creada para paciente ID ${patientId}: ${JSON.stringify({
          nombre: dto.nombre,
          dosis: dto.dosis,
          frecuencia: dto.frecuencia,
          detalles: dto.detalles,
        })}`,
      );
      return await this.medicationRepo.save(medication);
    } catch (error) {
      handleServiceError(error, this.logger, 'createMedication', 'Error al crear medicación');
    }
  }

  async deleteMedication(id: number) {
    try {
      const res = await this.medicationRepo.softDelete(id);
      if (res.affected === 0) throw new NotFoundException('Medicación no encontrada');
      deleteLogger.info(`Medicación eliminada: ID ${id}`);
      return { success: true };
    } catch (error) {
      handleServiceError(error, this.logger, 'deleteMedication', 'Error al eliminar medicación');
    }
  }

  // --- Bioanalysis ---
  async createBioanalysis(patientId: number, dto: CreateBioanalysisDto) {
    try {
      const patient = await this.getPatient(patientId);
      const bio = this.bioRepo.create({ ...dto, patient });
      return await this.bioRepo.save(bio);
    } catch (error) {
      handleServiceError(error, this.logger, 'createBioanalysis', 'Error al crear análisis bioquímico');
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
