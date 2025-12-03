import { IsString, IsOptional } from 'class-validator';

export class CreateMedicationDto {
  @IsString()
  nombre!: string;

  @IsOptional()
  @IsString()
  dosis?: string;

  @IsOptional()
  @IsString()
  frecuencia?: string;

  @IsOptional()
  @IsString()
  detalles?: string;
}
