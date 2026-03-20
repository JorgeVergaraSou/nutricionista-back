//src/visits/visit.module.ts
import { Module } from '@nestjs/common';
import { VisitsService } from './visit.service';
import { VisitsController } from './visit.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VisitEntity } from './entities/visit.entity';
import { PatientEntity } from '@/patients/entities/patient.entity';
import { TurnoEntity } from '@/turnos/entities/turno.entity';
import { AnthropometricEntity } from '@/patients/entities/anthropometric.entity';
import { PatientFileEntity } from '@/patient-files/entities/patient-file.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VisitEntity, PatientEntity, TurnoEntity, AnthropometricEntity, PatientFileEntity])],
  controllers: [VisitsController],
  providers: [VisitsService],
})
export class VisitsModule {}
