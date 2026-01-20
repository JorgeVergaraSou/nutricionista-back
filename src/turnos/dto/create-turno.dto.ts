import { EstadoTurno } from '@/common/enums/estado-turno.enum';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CrearTurnoDto {
  @IsInt()
  pacienteId: number;

  @IsDateString()
  fecha: string; // YYYY-MM-DD

  @IsNotEmpty()
  hora: string; // HH:mm

  @IsOptional()
  @IsEnum(EstadoTurno)
  estado?: EstadoTurno;

  @IsOptional()
  @IsString()
  observaciones?: string;
}
