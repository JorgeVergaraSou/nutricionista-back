// src/patient-files/entities/patient-file.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

import { PatientEntity } from '@/patients/entities/patient.entity';
import { VisitEntity } from '@/visits/entities/visit.entity';

@Entity('patient_files')
export class PatientFileEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  filename!: string;

  @Column()
  originalName!: string;

  @Column()
  mimeType!: string;

  @Column()
  storagePath!: string;

  @Column({ type: 'bigint' })
  size!: number;

  @ManyToOne(() => PatientEntity, {
    onDelete: 'CASCADE',
  })
  patient!: PatientEntity;

  @ManyToOne(() => VisitEntity, (v) => v.files, {
    onDelete: 'CASCADE',
  })
  visit!: VisitEntity;

  @CreateDateColumn()
  uploadedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}