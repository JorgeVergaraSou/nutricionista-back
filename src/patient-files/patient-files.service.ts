//src/patient-files/patient-files.service.ts
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatientFileEntity } from './entities/patient-file.entity';
import { PatientEntity } from '@/patients/entities/patient.entity';
import { VisitEntity } from '@/visits/entities/visit.entity';
import * as fs from 'fs';

@Injectable()
export class PatientFilesService {
  constructor(
    @InjectRepository(PatientFileEntity)
    private readonly fileRepo: Repository<PatientFileEntity>,
  ) {}

  async create(
    patient: PatientEntity,
    visit: VisitEntity,
    file: Express.Multer.File,
  ) {
    const entity = this.fileRepo.create({
      patient,
      visit,
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      storagePath: file.path,
      size: file.size,
    });

    return this.fileRepo.save(entity);
  }

  async findAllByPatient(patientId: number) {
    return this.fileRepo.find({
      where: {
        patient: { id: patientId },
      },
      relations: ['visit'],
      order: { uploadedAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const file = await this.fileRepo.findOne({
      where: { id },
      relations: ['patient', 'visit'],
    });

    if (!file) {
      throw new NotFoundException('Archivo no encontrado');
    }

    return file;
  }

  async remove(id: number) {
    const file = await this.findOne(id);

    if (fs.existsSync(file.storagePath)) {
      fs.unlinkSync(file.storagePath);
    }

    await this.fileRepo.remove(file);

    return { message: 'Archivo eliminado' };
  }
}