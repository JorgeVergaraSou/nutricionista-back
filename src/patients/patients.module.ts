import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientsController } from './patients.controller';
import { PatientsService } from './patients.service';
import { PatientEntity } from './entities/patient.entity';
import { Antecedent } from './entities/antecedent.entity';
import { Medication } from './entities/medication.entity';
import { Bioanalysis } from './entities/bioanalysis.entity';
import { AnthropometricEntity } from './entities/anthropometric.entity';
import { VisitEntity } from '@/visits/entities/visit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PatientEntity, Antecedent, Medication, Bioanalysis, AnthropometricEntity, VisitEntity])],
  controllers: [PatientsController],
  providers: [PatientsService],
  exports: [PatientsService],
})
export class PatientsModule {}
