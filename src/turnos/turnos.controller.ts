// src/turnos/turnos.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { TurnosService } from './turnos.service';

import { ConsultarTurnosDto } from './dto/consultar-turnos.dto';
import { CrearTurnoDto } from './dto/create-turno.dto';
import { ActualizarTurnoDto } from './dto/update-turno.dto';

@Controller('turnos')
export class TurnosController {
  constructor(private readonly service: TurnosService) {}

  @Post()
  crear(@Body() dto: CrearTurnoDto) {
    return this.service.crear(dto);
  }

  @Get()
  buscarPorFecha(@Query() query: ConsultarTurnosDto) {
    return this.service.buscarPorFecha(query.fecha);
  }

  @Get(':id')
obtenerPorId(@Param('id') id: number) {
  return this.service.obtenerPorId(+id);
}

  @Patch(':id')
  actualizar(@Param('id') id: number, @Body() dto: ActualizarTurnoDto) {
    return this.service.actualizar(+id, dto);
  }

  @Delete(':id')
  eliminar(@Param('id') id: number) {
    return this.service.eliminar(+id);
  }
}
