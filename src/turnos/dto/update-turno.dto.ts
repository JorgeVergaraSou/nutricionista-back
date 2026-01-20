import { PartialType } from '@nestjs/mapped-types';
import { CrearTurnoDto } from './create-turno.dto';

export class ActualizarTurnoDto extends PartialType(CrearTurnoDto) {}
