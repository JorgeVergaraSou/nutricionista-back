//src/patients/entities/bioanalysis.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, DeleteDateColumn } from 'typeorm';
import { PatientEntity } from './patient.entity';
import { VisitEntity } from '@/visits/entities/visit.entity';

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

  @ManyToOne(() => VisitEntity, (v) => v.analisisBioquimicos, {
  nullable: true,
  onDelete: 'SET NULL',
})
visita?: VisitEntity | null;


  @DeleteDateColumn()
  deletedAt?: Date;
}
