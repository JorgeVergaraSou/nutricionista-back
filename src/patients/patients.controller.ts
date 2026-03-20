//src/patients/patients.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Put,
  Delete,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { CreateAntecedentDto } from './dto/create-antecedent.dto';
import { CreateBioanalysisDto } from './dto/create-bioanalysis.dto';
import { CreateAnthropometricDto } from './dto/create-anthropometric.dto';
import { CreateFullPatientDto } from './dto/create-full-patient.dto';

@Controller('patients')
export class PatientsController {
  constructor(private readonly svc: PatientsService) { }

  // --- Pacientes ---


  @Post('registro-completo')
  createFull(@Body() dto: CreateFullPatientDto) {
    return this.svc.createFullPatient(dto);
  }

  @Get('autocomplete')
  async autocomplete(
    @Query('q') term: string,
    @Query('page', new DefaultValuePipe(1)) page: number,
    @Query('limit', new DefaultValuePipe(10)) limit: number,
  ) {
    return this.svc.autocompletePatients(term, Number(page), Number(limit));
  }

  @Get()
  list(
    @Query('q') q?: string,
    @Query('page', new DefaultValuePipe(1)) page = 1,
    @Query('limit', new DefaultValuePipe(10)) limit = 10,
  ) {
    return this.svc.searchPatients(q || '', Number(page), Number(limit));
  }

  @Get('perfil/:id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.svc.getPatient(id);
  }

  @Get(':id/clinical-history')
  getClinicalHistory(
    @Param('id', ParseIntPipe) id: number,
  ) {
    console.log('Generando historia clínica para paciente ID', id);
    return this.svc.getClinicalHistory(id);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePatientDto) {
    return this.svc.updatePatient(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.deletePatient(id);
  }

  // --- Antecedentes ---
  @Post(':id/antecedents')
  createAntecedent(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateAntecedentDto) {
    return this.svc.createAntecedent(id, dto);
  }

  @Delete('antecedents/:aid')
  deleteAntecedent(@Param('aid', ParseIntPipe) aid: number) {
    return this.svc.deleteAntecedent(aid);
  }


  // --- Análisis bioquímicos ---
  @Post(':id/bioanalysis')
  createBioanalysis(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateBioanalysisDto) {
    return this.svc.createBioanalysis(id, dto);
  }

  @Delete('bioanalysis/:bid')
  deleteBioanalysis(@Param('bid', ParseIntPipe) bid: number) {
    return this.svc.deleteBioanalysis(bid);
  }

  // --- Medidas antropométricas ---
  @Post(':id/anthropometrics')
  createAnthropometric(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateAnthropometricDto) {
    return this.svc.createAnthropometric(id, dto);
  }

  @Delete('anthropometrics/:aid')
  deleteAnthropometric(@Param('aid', ParseIntPipe) aid: number) {
    return this.svc.deleteAnthropometric(aid);
  }
}
