import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, DeleteDateColumn } from 'typeorm';
import { PatientEntity } from './patient.entity';

@Entity('antecedents')
export class Antecedent {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 150 })
  tipo!: string;

  @Column({ type: 'text' })
  descripcion!: string;

  @ManyToOne(() => PatientEntity, (p) => p.antecedentes, { onDelete: 'CASCADE' })
  patient!: PatientEntity;

  @DeleteDateColumn()
  deletedAt?: Date;
}
