// src/patients/dto/create-anthropometric.dto.ts
import { IsDateString, IsOptional, IsNumber, IsInt, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateAnthropometricDto {
  @IsDateString()
  fecha!: string;

  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : null))
  @IsNumber({}, { message: 'La talla debe ser un número válido' })
  talla?: number | null;

  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : null))
  @IsNumber({}, { message: 'El peso debe ser un número válido' })
  peso?: number | null;

  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : null))
  @IsNumber({}, { message: 'El IMC debe ser un número válido' })
  imc?: number | null;

  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : null))
  @IsNumber({}, { message: 'El % grasa ABD debe ser un número válido' })
  porcentajeGrasaABD?: number | null;

  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : null))
  @IsNumber({}, { message: 'El % músculo debe ser un número válido' })
  porcentajeMusculo?: number | null;

  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : null))
  @IsNumber({}, { message: 'El % grasa debe ser un número válido' })
  porcentajeGrasa?: number | null;

  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : null))
  @IsNumber({}, { message: 'Las kcal basales deben ser un número válido' })
  kcalBasales?: number | null;

  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : null))
  @IsNumber({}, { message: 'La circunferencia abdominal debe ser un número válido' })
  circAbdominal?: number | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  visitId?: number;
}
