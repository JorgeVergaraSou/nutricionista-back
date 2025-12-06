import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, DeleteDateColumn } from 'typeorm';
import { PatientEntity } from './patient.entity';

@Entity('medications')
export class Medication {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 200 })
  nombre!: string;

  @Column({ type: 'text', nullable: true })
  enfermedadRelacionada!: string | null; // puedes usar esto para "Enfermedad" vinculada a la medicación

  @Column({ type: 'text', nullable: true })
  detalles!: string | null;

  @ManyToOne(() => PatientEntity, (p) => p.medicaciones, { onDelete: 'CASCADE' })
  patient!: PatientEntity;

  @DeleteDateColumn()
  deletedAt?: Date;
}
