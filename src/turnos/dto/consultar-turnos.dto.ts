import { IsDateString } from 'class-validator';

export class ConsultarTurnosDto {
  @IsDateString()
  fecha: string;
}