//src/visits/entities/visit.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

import { PatientEntity } from '@/patients/entities/patient.entity';
import { AnthropometricEntity } from '@/patients/entities/anthropometric.entity';
import { Bioanalysis } from '@/patients/entities/bioanalysis.entity';
import { PatientFileEntity } from '@/patient-files/entities/patient-file.entity';
import { PrescriptionEntity } from '@/patients/entities/prescription.entity';
import { TurnoEntity } from '@/turnos/entities/turno.entity';

@Entity('visits')
export class VisitEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn()
  fecha!: Date;

  @Column({ type: 'text', nullable: true })
  motivoConsulta!: string | null;

  @Column({ type: 'text', nullable: true })
  enfermedadActual!: string | null;

  @Column({ type: 'text', nullable: true })
  examenFisico!: string | null;

  @Column({ type: 'text', nullable: true })
  diagnostico!: string | null;

  @Column({ type: 'text', nullable: true })
  planTratamiento!: string | null;

  @Column({ type: 'text', nullable: true })
  evolucion!: string | null;

  @Column({ type: 'text', nullable: true })
  observaciones!: string | null;

  @ManyToOne(() => PatientEntity, (p) => p.visitas, {
    onDelete: 'CASCADE',
  })
  paciente!: PatientEntity;

  // 🔴 ahora es opcional
  @OneToOne(() => TurnoEntity, (turno) => turno.visita, {
    nullable: true,
  })
  @JoinColumn()
  turno?: TurnoEntity;

  @OneToMany(() => AnthropometricEntity, (a) => a.visita)
  medicionesAntropometricas!: AnthropometricEntity[];

  @OneToMany(() => Bioanalysis, (b) => b.visita)
  analisisBioquimicos!: Bioanalysis[];

  @OneToMany(() => PrescriptionEntity, (p) => p.visita)
  prescripciones!: PrescriptionEntity[];

  @OneToMany(() => PatientFileEntity, (f) => f.visit)
  files!: PatientFileEntity[];

  @DeleteDateColumn()
  deletedAt?: Date;
}