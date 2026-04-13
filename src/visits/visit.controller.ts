// src/visits/visit.controller.ts
import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';

import { VisitsService } from './visit.service';
import { CreateVisitDto } from './dto/create-visit.dto';
import { UpdateVisitDto } from './dto/update-visit.dto';
import { CreateFullVisitDto } from './dto/create-full-visit.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UseInterceptors, UploadedFiles } from '@nestjs/common';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import { v4 as uuid } from 'uuid';
import { VisitResponseDto } from './dto/visit-response.dto';

@Controller('visits')
export class VisitsController {
  constructor(private readonly visitsService: VisitsService) {}

  // 🆕 Crear visita
  
  @Post('crear-visita')
  create(@Body() dto: CreateVisitDto) {
    return this.visitsService.create(dto);
  }

/** ==============================
 * INICIO NUEVA VISITA FULL
 * ===============================
*/
@Post('full')
@UseInterceptors(
  FilesInterceptor('files', 5, {
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
    fileFilter: (req, file, cb) => {
      const allowed = [
        'application/pdf',
        'image/jpeg',
        'image/png',
      ];

      if (!allowed.includes(file.mimetype)) {
        return cb(
          new BadRequestException('Tipo de archivo no permitido'),
          false,
        );
      }

      cb(null, true);
    },
  }),
)
async createFull(
  @UploadedFiles() files: Express.Multer.File[],
  @Body() body: any,
) {
  // 🔥 PARSEO COMPLETO
  const dto: CreateFullVisitDto = {
    ...body,

    patientId: Number(body.patientId),
    turnoId: body.turnoId ? Number(body.turnoId) : undefined,

    antropometria: body.antropometria
      ? JSON.parse(body.antropometria)
      : undefined,

    prescripciones: body.prescripciones
      ? JSON.parse(body.prescripciones)
      : undefined,

    analisisBioquimicos: body.analisisBioquimicos
      ? JSON.parse(body.analisisBioquimicos)
      : undefined,
  };

  return this.visitsService.createFullVisit(dto, files);
}

/** ==============================
 * FIN NUEVA VISITA FULL
 * ===============================
*/

@Get('/patient/:id')
findByPatient(
  @Param('id', ParseIntPipe) id: number,
): Promise<VisitResponseDto[]> {
  return this.visitsService.findByPatient(id);
}

  // ✏️ Actualizar visita
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateVisitDto,
  ) {
    return this.visitsService.update(id, dto);
  }
}
