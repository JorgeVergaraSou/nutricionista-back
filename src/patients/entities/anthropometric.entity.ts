// src/patients/entities/anthropometric.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  DeleteDateColumn,
} from 'typeorm';

import { PatientEntity } from './patient.entity';
import { VisitEntity } from '@/visits/entities/visit.entity';

@Entity('anthropometrics')
export class AnthropometricEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'date' })
  fecha!: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  talla!: number | null;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  peso!: number | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  imc!: number | null;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  circAbdominal!: number | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  porcentajeGrasa!: number | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  porcentajeGrasaABD!: number | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  porcentajeMusculo!: number | null;

  @Column({ type: 'decimal', precision: 7, scale: 2, nullable: true })
  kcalBasales!: number | null;

  @ManyToOne(() => PatientEntity, {
    onDelete: 'CASCADE',
  })
  patient!: PatientEntity;

  // ✅ AHORA ES OPCIONAL
  @ManyToOne(() => VisitEntity, (v) => v.medicionesAntropometricas, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  visita?: VisitEntity | null;

  @DeleteDateColumn()
  deletedAt?: Date;
}