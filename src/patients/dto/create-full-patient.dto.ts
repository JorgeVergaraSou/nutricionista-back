// src/patients/dto/create-full-patient.dto.ts
import { Type } from 'class-transformer';
import { ValidateNested, IsString, IsOptional, IsDateString, IsArray } from 'class-validator';
import { CreateAntecedentDto } from './create-antecedent.dto';
import { CreateBioanalysisDto } from './create-bioanalysis.dto';
import { CreateAnthropometricDto } from './create-anthropometric.dto';
import { Transform } from 'class-transformer';
import { CreateVisitInsideFullDto } from './create-visit-inside-full.dto';

export class CreateFullPatientDto {
  @IsString()
  nombre!: string;

  @IsString()
  apellido!: string;

  @IsString()
  dni!: string;

// 🔹 Transforma fechas tipo "dd/mm/yyyy" → "yyyy-mm-dd"
  @IsOptional()
  @IsDateString({}, { message: 'fechaNacimiento must be a valid ISO 8601 date string (YYYY-MM-DD)' })
  @Transform(({ value }) => {
    if (!value) return null;

    // Si ya viene en formato válido, se deja como está
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

    // Si viene como "dd/mm/yyyy" o "dd-mm-yyyy"
    const match = /^(\d{2})[/-](\d{2})[/-](\d{4})$/.exec(value);
    if (match) {
      const [, dd, mm, yyyy] = match;
      return `${yyyy}-${mm}-${dd}`;
    }

    // Si viene en formato inesperado, lo dejamos pasar para que ClassValidator lo capture
    return value;
  })
  fechaNacimiento?: string | null;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  actividadFisica?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAntecedentDto)
  antecedentes?: CreateAntecedentDto[];

@IsOptional()
@IsArray()
@ValidateNested({ each: true })
@Type(() => CreateBioanalysisDto)
analisisBioquimicos?: CreateBioanalysisDto[];

@IsOptional()
@IsArray()
@ValidateNested({ each: true })
@Type(() => CreateAnthropometricDto)
medicionesAntropometricas?: CreateAnthropometricDto[];

    @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVisitInsideFullDto)
  visitas?: CreateVisitInsideFullDto[];
}
