// src/patients/entities/patient.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';

import { Antecedent } from './antecedent.entity';
import { VisitEntity } from '@/visits/entities/visit.entity';
import { TurnoEntity } from '@/turnos/entities/turno.entity';

@Entity('patients')
export class PatientEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 150 })
  @Index()
  nombre!: string;

  @Column({ length: 150 })
  @Index()
  apellido!: string;

  @Column({ type: 'date', nullable: true })
  fechaNacimiento!: string | null;

  @Column({ length: 20, unique: true })
  dni!: string;

  @Column({ length: 255, nullable: true })
  direccion!: string;

  @Column({ length: 50, nullable: true })
  telefono!: string;

  @Column({ length: 150, nullable: true })
  email!: string;

  @Column({ type: 'text', nullable: true })
  actividadFisica!: string;

  // Relaciones
  @OneToMany(() => Antecedent, (a) => a.patient)
  antecedentes!: Antecedent[];

  @OneToMany(() => VisitEntity, (v) => v.paciente)
  visitas!: VisitEntity[];

  @OneToMany(() => TurnoEntity, (t) => t.paciente)
  turnos!: TurnoEntity[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}