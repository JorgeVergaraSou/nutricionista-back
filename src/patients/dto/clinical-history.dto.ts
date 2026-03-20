//src/patients/dto/clinical-history.dto.ts
export type ClinicalHistoryType =
  | 'VISITA'
  | 'ANTROPOMETRIA'
  | 'ANALISIS'
  | 'PRESCRIPCION'
  | 'ARCHIVO';

export class ClinicalHistoryItemDto {
  fecha!: Date;

  tipo!: ClinicalHistoryType;

  data!: any;
}