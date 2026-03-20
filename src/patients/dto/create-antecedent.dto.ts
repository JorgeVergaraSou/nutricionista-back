import { IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';
import { AntecedentType } from '@/common/enums/antecedentes.enum';

export class CreateAntecedentDto {

  @IsEnum(AntecedentType)
  tipo!: AntecedentType;

  @IsString()
  titulo!: string;

  @IsOptional()
  @IsString()
  detalle?: string;

  @IsOptional()
  @IsDateString()
  fechaEvento?: Date;
}