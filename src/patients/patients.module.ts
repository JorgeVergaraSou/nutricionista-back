//src/patients/patients.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientsController } from './patients.controller';
import { PatientsService } from './patients.service';
import { PatientEntity } from './entities/patient.entity';
import { Antecedent } from './entities/antecedent.entity';

import { Bioanalysis } from './entities/bioanalysis.entity';
import { AnthropometricEntity } from './entities/anthropometric.entity';
import { VisitEntity } from '@/visits/entities/visit.entity';
import { PrescriptionEntity } from './entities/prescription.entity';
import { PatientFileEntity } from '@/patient-files/entities/patient-file.entity';
import { BioanalysisItem } from './entities/bioanalysis-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PatientEntity, Antecedent, Bioanalysis, 
    AnthropometricEntity, VisitEntity, PrescriptionEntity, PatientFileEntity,
  BioanalysisItem])],
  controllers: [PatientsController],
  providers: [PatientsService],
  exports: [PatientsService],
})
export class PatientsModule {}
