import { Module } from '@nestjs/common';
import { VisitsService } from './visit.service';
import { VisitsController } from './visit.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VisitEntity } from './entities/visit.entity';
import { PatientEntity } from '@/patients/entities/patient.entity';
import { TurnoEntity } from '@/turnos/entities/turno.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VisitEntity, PatientEntity, TurnoEntity])],
  controllers: [VisitsController],
  providers: [VisitsService],
})
export class VisitsModule {}
