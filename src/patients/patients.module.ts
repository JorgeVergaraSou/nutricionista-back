import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientsController } from './patients.controller';
import { PatientsService } from './patients.service';
import { PatientEntity } from './entities/patient.entity';
import { Antecedent } from './entities/antecedent.entity';
import { Medication } from './entities/medication.entity';
import { Bioanalysis } from './entities/bioanalysis.entity';
import { Anthropometric } from './entities/anthropometric.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PatientEntity, Antecedent, Medication, Bioanalysis, Anthropometric])],
  controllers: [PatientsController],
  providers: [PatientsService],
  exports: [PatientsService],
})
export class PatientsModule {}
