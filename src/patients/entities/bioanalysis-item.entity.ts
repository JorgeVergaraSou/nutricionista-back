//src/patients/entities/bioanalysis-item.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';

import { Bioanalysis } from './bioanalysis.entity';
import { EstadoAnalisis } from '@/common/enums/estado_analisis';

@Entity('bioanalysis_items')
export class BioanalysisItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  nombre!: string; // glucosa, colesterol

  @Column({ type: 'float', nullable: true })
  valor!: number | null;

@Column({ type: 'varchar', nullable: true })
unidad!: string | null;


  @Column({ type: 'float', nullable: true })
  valorMin!: number | null;

  @Column({ type: 'float', nullable: true })
  valorMax!: number | null;

  @Column({ type: 'enum', enum: EstadoAnalisis })
  estado!: EstadoAnalisis;


  @ManyToOne(() => Bioanalysis, (a) => a.items, {
    onDelete: 'CASCADE',
  })
  analysis!: Bioanalysis;
}