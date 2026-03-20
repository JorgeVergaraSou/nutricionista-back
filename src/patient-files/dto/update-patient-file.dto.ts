import { PartialType } from '@nestjs/mapped-types';
import { CreatePatientFileDto } from './create-patient-file.dto';

export class UpdatePatientFileDto extends PartialType(CreatePatientFileDto) {}
