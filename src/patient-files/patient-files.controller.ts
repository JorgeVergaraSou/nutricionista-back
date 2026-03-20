// src/patient-files/patient-files.controller.ts
import {
  Controller,
  Post,
  Param,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { PatientFilesService } from './patient-files.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VisitEntity } from '@/visits/entities/visit.entity';
import * as fs from 'fs';
import { v4 as uuid } from 'uuid';

@Controller('visits/:visitId/files')
export class PatientFilesController {
  constructor(
    private readonly service: PatientFilesService,

    @InjectRepository(VisitEntity)
    private readonly visitRepo: Repository<VisitEntity>,
  ) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const tempPath = './uploads/temp';
          fs.mkdirSync(tempPath, { recursive: true });
          cb(null, tempPath);
        },
        filename: (req, file, cb) => {
          cb(null, `${uuid()}-${file.originalname}`);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  )
  async upload(
    @Param('visitId') visitId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const visit = await this.visitRepo.findOne({
      where: { id: Number(visitId) },
      relations: ['paciente'],
    });

    if (!visit) {
      throw new BadRequestException('Visita no encontrada');
    }

    const finalPath = `./uploads/patients/${visit.paciente.id}/visits/${visit.id}`;
    fs.mkdirSync(finalPath, { recursive: true });

    const newPath = `${finalPath}/${file.filename}`;
    fs.renameSync(file.path, newPath);

    file.path = newPath;

    return this.service.create(visit.paciente, visit, file);
  }
}