import {
  IsInt,
  IsString,
  IsOptional,
  ValidateNested,
  IsNumber,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

// ----------------------------
// ANTROPOMETRIA
// ----------------------------
class AnthropometricInput {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  peso?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  talla?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  circAbdominal?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  porcentajeGrasa?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  porcentajeGrasaABD?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  porcentajeMusculo?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  kcalBasales?: number;
}

// ----------------------------
// PRESCRIPCIONES
// ----------------------------
class PrescriptionInput {
  @IsString()
  medicamento: string;

  @IsString()
  dosis: string;

  @IsString()
  intervalo: string;

  @IsOptional()
  fechaInicio?: Date;

  @IsOptional()
  fechaFin?: Date;
}

// ----------------------------
// ANALISIS ITEMS
// ----------------------------
class BioItemInput {
  @IsString()
  nombre: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  valor?: number;

  @IsOptional()
  @IsString()
  unidad?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  valorMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  valorMax?: number;
}

// ----------------------------
// ANALISIS
// ----------------------------
class BioanalysisInput {
  @IsString()
  tipo: string;

  @IsOptional()
  @IsString()
  resultados?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BioItemInput)
  items?: BioItemInput[];
}

// ----------------------------
// DTO PRINCIPAL
// ----------------------------
export class CreateFullVisitDto {
  @Type(() => Number)
  @IsInt()
  patientId: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  turnoId?: number;

  @IsString()
  motivoConsulta: string;

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
  @ValidateNested()
  @Type(() => AnthropometricInput)
  antropometria?: AnthropometricInput;

  // ✅ NUEVO
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PrescriptionInput)
  prescripciones?: PrescriptionInput[];

  // ✅ NUEVO
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BioanalysisInput)
  analisisBioquimicos?: BioanalysisInput[];
}