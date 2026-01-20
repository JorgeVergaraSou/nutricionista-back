import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TurnosService } from './turnos.service';
import { TurnosController } from './turnos.controller';
import { TurnoEntity } from './entities/turno.entity';
import { PatientEntity } from '@/patients/entities/patient.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TurnoEntity, PatientEntity])],
  controllers: [TurnosController],
  providers: [TurnosService],
})
export class TurnosModule {}
