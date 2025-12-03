//src/patients/entities/bioanalysis.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { PatientEntity } from './patient.entity';

@Entity('bioanalysis')
export class Bioanalysis {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 150 })
  tipo!: string; // ej. "Hemograma", "Glucemia", etc.

  @Column({ type: 'text' })
  resultados!: string;

  @Column({ type: 'date', nullable: true })
  fecha!: string | null;

  @ManyToOne(() => PatientEntity, (p) => p.analisisBioquimicos, { onDelete: 'CASCADE' })
  patient!: PatientEntity;
}
