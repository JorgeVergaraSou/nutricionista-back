import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { PatientEntity } from './patient.entity';

@Entity('anthropometrics')
export class Anthropometric {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'date' })
  fecha!: string;

  // Talla en metros (ej. 1.70). Si prefieres cm, documentalo.
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  talla!: number | null;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  peso!: number | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  imc!: number | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  porcentajeGrasaABD!: number | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  porcentajeMusculo!: number | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  porcentajeGrasa!: number | null;

  @Column({ type: 'int', nullable: true })
  kcalBasales!: number | null;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  circAbdominal!: number | null;

  @ManyToOne(() => PatientEntity, (p) => p.medicionesAntropometricas, { onDelete: 'CASCADE' })
  patient!: PatientEntity;
}
