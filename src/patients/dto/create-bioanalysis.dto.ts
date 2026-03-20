//src/patients/dto/create-bioanalysis.dto.ts
import {
  IsString,
  IsOptional,
  IsDateString,
  ValidateNested,
  IsArray,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

class BioanalysisItemDto {
  @IsString()
  nombre!: string;

  @IsOptional()
  @IsNumber()
  valor?: number;

  @IsOptional()
  @IsString()
  unidad?: string;

  @IsOptional()
  @IsNumber()
  valorMin?: number;

  @IsOptional()
  @IsNumber()
  valorMax?: number;
}

export class CreateBioanalysisDto {
  @IsString()
  tipo!: string;

  @IsOptional()
  @IsString()
  resultados?: string; // 🔥 sigue existiendo

  @IsOptional()
  @IsDateString()
  fecha?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BioanalysisItemDto)
  items?: BioanalysisItemDto[];
}