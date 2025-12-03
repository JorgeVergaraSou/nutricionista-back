import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { PatientEntity } from './patient.entity';

@Entity('antecedents')
export class Antecedent {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text' })
  descripcion!: string;

  @ManyToOne(() => PatientEntity, (p) => p.antecedentes, { onDelete: 'CASCADE' })
  patient!: PatientEntity;
}
