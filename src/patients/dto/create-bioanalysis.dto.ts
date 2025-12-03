import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateBioanalysisDto {
  @IsString()
  tipo!: string;

  @IsString()
  resultados!: string;

  @IsOptional()
  @IsDateString()
  fecha?: string;
}
