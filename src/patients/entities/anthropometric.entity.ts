// src/patients/entities/anthropometric.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, DeleteDateColumn } from 'typeorm';
import { PatientEntity } from './patient.entity';
import { VisitEntity } from '@/visits/entities/visit.entity';

@Entity('anthropometrics')
export class AnthropometricEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'date' })
  fecha!: Date;

  // Talla en metros (ej. 1.70). Si prefieres cm, documentalo.
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  talla!: number | null;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  peso!: number | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  imc!: number | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  porcentajeGrasaABD!: number | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  porcentajeMusculo!: number | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  porcentajeGrasa!: number | null;

  @Column({ type: 'int', nullable: true })
  kcalBasales!: number | null;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  circAbdominal!: number | null;

  @ManyToOne(() => PatientEntity, (p) => p.medicionesAntropometricas, { onDelete: 'CASCADE' })
  patient!: PatientEntity;

  @ManyToOne(() => VisitEntity, (v) => v.medicionesAntropometricas, {
  nullable: true,
  onDelete: 'SET NULL',
})
visita?: VisitEntity | null;


  @DeleteDateColumn()
  deletedAt?: Date;
}
