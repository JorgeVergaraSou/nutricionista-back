// src/patients/dto/create-patient.dto.ts
import { IsString, IsOptional, IsDateString, IsEmail, Length } from 'class-validator';
import { Transform } from 'class-transformer';


export class CreatePatientDto {
  @IsString()
  nombre!: string;

  @IsString()
  apellido!: string;

// 🔹 Transforma fechas tipo "dd/mm/yyyy" → "yyyy-mm-dd"
  @IsOptional()
  @IsDateString({}, { message: 'fechaNacimiento must be a valid ISO 8601 date string (YYYY-MM-DD)' })
  @Transform(({ value }) => {
    if (!value) return null;

    // Si ya viene en formato válido, se deja como está
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

    // Si viene como "dd/mm/yyyy" o "dd-mm-yyyy"
    const match = /^(\d{2})[/-](\d{2})[/-](\d{4})$/.exec(value);
    if (match) {
      const [, dd, mm, yyyy] = match;
      return `${yyyy}-${mm}-${dd}`;
    }

    // Si viene en formato inesperado, lo dejamos pasar para que ClassValidator lo capture
    return value;
  })
  fechaNacimiento?: string | null;

  @IsString()
  @Length(3, 20)
  dni!: string;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  actividadFisica?: string;
}
