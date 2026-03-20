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
  ParseIntPipe,
} from '@nestjs/common';
import { TurnosService } from './turnos.service';

import { ConsultarTurnosDto } from './dto/consultar-turnos.dto';
import { CrearTurnoDto } from './dto/create-turno.dto';
import { ActualizarTurnoDto } from './dto/update-turno.dto';

@Controller('turnos')
export class TurnosController {
  constructor(private readonly service: TurnosService) { }

  @Post('dar_turno')
  crear(@Body() dto: CrearTurnoDto) {
    return this.service.crear(dto);
  }

  @Get('turnos_por_fecha')
  buscarPorFecha(@Query() query: ConsultarTurnosDto) {
    return this.service.buscarPorFecha(query.fecha);
  }

  @Get('turno_por_id/:id')
  obtenerPorId(@Param('id') id: number) {
    return this.service.obtenerPorId(id);
  }

  @Patch('actualizar_turno/:id')
  actualizar(@Param('id') id: number, @Body() dto: ActualizarTurnoDto) {
    return this.service.actualizar(id, dto);
  }

  @Delete('eliminar_turno/:id')
  eliminar(@Param('id') id: number) {
    return this.service.eliminar(id);
  }

  @Patch('/no-asistio/:id')
  marcarNoAsistio(@Param('id', ParseIntPipe) id: number) {
    return this.service.marcarNoAsistio(id);
  }
@Get('historial')
obtenerHistorial(
  @Query('desde') desde?: string,
  @Query('hasta') hasta?: string,
) {
  return this.service.obtenerHistorial(desde, hasta);
}
}
