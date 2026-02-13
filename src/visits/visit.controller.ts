// src/visits/visit.controller.ts
import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';

import { VisitsService } from './visit.service';
import { CreateVisitDto } from './dto/create-visit.dto';
import { UpdateVisitDto } from './dto/update-visit.dto';
import { CreateFullVisitDto } from './dto/create-full-visit.dto';

@Controller('visits')
export class VisitsController {
  constructor(private readonly visitsService: VisitsService) {}

  // 🆕 Crear visita
  @Post()
  create(@Body() dto: CreateVisitDto) {
    return this.visitsService.create(dto);
  }

  @Post('full')
createFull(@Body() dto: CreateFullVisitDto) {
  return this.visitsService.createFullVisit(dto);
}

  // 📋 Historial de visitas del paciente
  @Get('patient/:id')
  findByPatient(@Param('id', ParseIntPipe) patientId: number) {
    return this.visitsService.findByPatient(patientId);
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
