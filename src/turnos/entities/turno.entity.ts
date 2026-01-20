import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { PatientEntity } from '@/patients/entities/patient.entity';
import { EstadoTurno } from '@/common/enums/estado-turno.enum';


@Entity('turnos')
@Index(['fecha', 'hora'], { unique: true }) // evita doble turno en mismo horario
export class TurnoEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  fecha: string; // YYYY-MM-DD

  @Column({ type: 'time' })
  hora: string; // HH:mm

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

  @CreateDateColumn()
  creadoEn: Date;

  @UpdateDateColumn()
  actualizadoEn: Date;
}
