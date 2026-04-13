// src/patients/entities/bioanalysis.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  DeleteDateColumn,
} from 'typeorm';
import { OneToMany } from 'typeorm';
import { BioanalysisItem } from './bioanalysis-item.entity';
import { PatientEntity } from './patient.entity';
import { VisitEntity } from '@/visits/entities/visit.entity';

@Entity('bioanalysis')
export class Bioanalysis {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 150 })
  tipo!: string;

  @Column({ type: 'text', nullable: true })
  resultados!: string | null;

  @Column({ type: 'date', nullable: true })
  fecha!: Date | null;

  @OneToMany(() => BioanalysisItem, (item) => item.analysis, {
    cascade: true,
  })
  items!: BioanalysisItem[];

  @ManyToOne(() => PatientEntity, {
    onDelete: 'CASCADE',
  })
  patient!: PatientEntity;

  @ManyToOne(() => VisitEntity, (v) => v.analisisBioquimicos, {
    onDelete: 'CASCADE',
  })
  visita!: VisitEntity;

  @DeleteDateColumn()
  deletedAt?: Date;
}