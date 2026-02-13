//src/visits/entities/visit.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

import { PatientEntity } from '@/patients/entities/patient.entity';
import { TurnoEntity } from '@/turnos/entities/turno.entity';
import { AnthropometricEntity } from '@/patients/entities/anthropometric.entity';
import { Bioanalysis } from '@/patients/entities/bioanalysis.entity';

@Entity('visits')
export class VisitEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  // --------------------------------------------------
  // Relaciones
  // --------------------------------------------------

  @ManyToOne(() => PatientEntity, (p) => p.visitas, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @Index()
  paciente!: PatientEntity;

  @ManyToOne(() => TurnoEntity, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  turno?: TurnoEntity | null;

  // --------------------------------------------------
  // Datos clínicos de la visita
  // --------------------------------------------------

  @Column({ type: 'date' })
  fecha!: Date;

  @Column({ type: 'varchar', length: 150, nullable: true })
  motivoConsulta!: string | null;

  @Column({ type: 'text', nullable: true })
  observaciones!: string | null;

  @Column({ type: 'text', nullable: true })
  planTratamiento!: string | null;

  @Column({ type: 'text', nullable: true })
  evolucion!: string | null;

  // --------------------------------------------------
  // Relaciones con datos médicos (históricos)
  // --------------------------------------------------

  @OneToMany(() => AnthropometricEntity, (a) => a.visita)
  medicionesAntropometricas!: AnthropometricEntity[];

  @OneToMany(() => Bioanalysis, (b) => b.visita)
  analisisBioquimicos!: Bioanalysis[];

  // --------------------------------------------------
  // Auditoría
  // --------------------------------------------------

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
