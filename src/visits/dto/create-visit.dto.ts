// src/visits/dto/create-visit.dto.ts
import {
  IsInt,
  IsOptional,
  IsString,
  IsDateString,
  Min,
} from 'class-validator';
import { Column } from 'typeorm';

export class CreateVisitDto {
  // --------------------------------------------------
  // Relaciones
  // --------------------------------------------------

  @IsInt()
  @Min(1)
  patientId!: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  turnoId?: number;

  // --------------------------------------------------
  // Datos de la visita
  // --------------------------------------------------

  @Column({ type: 'date' })
  fecha!: Date;

  @IsOptional()
  @IsString()
  motivoConsulta?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsString()
  planTratamiento?: string;

  @IsOptional()
  @IsString()
  evolucion?: string;
}
