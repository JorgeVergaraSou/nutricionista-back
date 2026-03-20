// src/patients/entities/prescription.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  DeleteDateColumn,
} from 'typeorm';

import { VisitEntity } from '@/visits/entities/visit.entity';
import { PatientEntity } from './patient.entity';

@Entity('prescriptions')
export class PrescriptionEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 200 })
  medicamento!: string;

  @Column({ length: 100 })
  dosis!: string;

  @Column({ length: 100 })
  intervalo!: string;

  @Column({ type: 'date', nullable: true })
  fechaInicio!: Date | null;

  @Column({ type: 'date', nullable: true })
  fechaFin!: Date | null;

  @Column({ default: true })
  activa!: boolean;

  @ManyToOne(() => PatientEntity, {
    onDelete: 'CASCADE',
  })
  patient!: PatientEntity;

  @ManyToOne(() => VisitEntity, (v) => v.prescripciones, {
    onDelete: 'CASCADE',
  })
  visita!: VisitEntity;

  @DeleteDateColumn()
  deletedAt?: Date;
}