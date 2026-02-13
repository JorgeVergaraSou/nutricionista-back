import { IsInt, IsString, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class AnthropometricInput {
  @IsInt()
  peso: number;

  @IsInt()
  talla: number;
}

export class CreateFullVisitDto {
  @IsInt()
  patientId: number;

  @IsInt()
  turnoId: number;

  @IsString()
  motivoConsulta: string;

  @IsString()
  observaciones: string;

  @IsString()
  planTratamiento: string;

  @IsString()
  evolucion: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => AnthropometricInput)
  antropometria?: AnthropometricInput;
}
