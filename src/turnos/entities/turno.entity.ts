//src/turnos/entities/turno.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToOne,
} from 'typeorm';

import { PatientEntity } from '@/patients/entities/patient.entity';
import { EstadoTurno } from '@/common/enums/estado-turno.enum';
import { VisitEntity } from '@/visits/entities/visit.entity';

@Entity('turnos')
@Index(['fecha', 'hora'], { unique: true })
export class TurnoEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  fecha: string;

  @Column({ type: 'time' })
  hora: string;

  @Column({
    type: 'enum',
    enum: EstadoTurno,
    default: EstadoTurno.CONFIRMADO,
  })
  estado: EstadoTurno;

  @Column({ type: 'text', nullable: true })
  observaciones?: string;

  @ManyToOne(() => PatientEntity, (patient) => patient.turnos, {
    onDelete: 'CASCADE',
    eager: true,
  })
  paciente: PatientEntity;

  

  // 🔐 Relación inversa con visita
  @OneToOne(() => VisitEntity, (v) => v.turno)
  visita?: VisitEntity;

  @CreateDateColumn()
  creadoEn: Date;

  @UpdateDateColumn()
  actualizadoEn: Date;
}