//src/patients/entities/antecedent.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  DeleteDateColumn,
  CreateDateColumn,
} from 'typeorm';

import { PatientEntity } from './patient.entity';
import { AntecedentType } from '@/common/enums/antecedentes.enum';

@Entity('antecedents')
export class Antecedent {

  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'enum',
    enum: AntecedentType,
  })
  tipo!: AntecedentType;

  @Column({ length: 200 })
  titulo!: string;

  @Column({ type: 'text', nullable: true })
  detalle?: string;

  @Column({ type: 'date', nullable: true })
  fechaEvento?: Date;

  @Column({ default: true })
  activo!: boolean;

  @ManyToOne(() => PatientEntity, (p) => p.antecedentes, {
    onDelete: 'CASCADE',
  })
  patient!: PatientEntity;

  @CreateDateColumn()
  createdAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}