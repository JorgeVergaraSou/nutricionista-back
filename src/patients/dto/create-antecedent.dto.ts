import { IsString } from 'class-validator';

export class CreateAntecedentDto {

  @IsString()
  tipo!: string;

  @IsString()
  descripcion!: string;
}
