import { IsOptional, IsString } from 'class-validator';

export class SearchPatientDto {
  @IsOptional()
  @IsString()
  q?: string; // búsqueda libre sobre nombre o dni

  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;
}
