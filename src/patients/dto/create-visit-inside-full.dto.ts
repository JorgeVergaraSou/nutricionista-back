// src/patients/dto/create-visit-inside-full.dto.ts
import {
  IsOptional,
  IsString,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateBioanalysisDto } from './create-bioanalysis.dto';
import { CreateAnthropometricDto } from './create-anthropometric.dto';

export class CreateVisitInsideFullDto {
  @IsOptional()
  @IsString()
  motivoConsulta?: string;

  @IsOptional()
  @IsString()
  enfermedadActual?: string;

  @IsOptional()
  @IsString()
  examenFisico?: string;

  @IsOptional()
  @IsString()
  diagnostico?: string;

  @IsOptional()
  @IsString()
  planTratamiento?: string;

  @IsOptional()
  @IsString()
  evolucion?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAnthropometricDto)
  medicionesAntropometricas?: CreateAnthropometricDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBioanalysisDto)
  analisisBioquimicos?: CreateBioanalysisDto[];
}