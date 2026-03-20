import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientFileEntity } from './entities/patient-file.entity';
import { PatientFilesService } from './patient-files.service';
import { PatientFilesController } from './patient-files.controller';
import { VisitEntity } from '@/visits/entities/visit.entity';
import { FilesModule } from '@/common/files/files.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PatientFileEntity,VisitEntity,]),
    FilesModule
  ],
  controllers: [PatientFilesController],
  providers: [PatientFilesService],
})
export class PatientFilesModule { }