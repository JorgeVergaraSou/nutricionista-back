//src/visits/dto/visit-response.dto.ts
export class VisitResponseDto {
  id: number;
  fecha: Date;

  motivoConsulta: string | null;
  enfermedadActual: string | null;
  examenFisico: string | null;
  diagnostico: string | null;
  planTratamiento: string | null;
  evolucion: string | null;
  observaciones: string | null;

  turno: {
    id: number;
    fecha: string;
    hora: string;
  } | null;

  medicionesAntropometricas: {
    id: number;
    peso: number | null;
    talla: number | null;
    imc: number | null;
  }[];

  analisisBioquimicos: {
    id: number;
    tipo: string;
    resultados: string | null;
  }[];

  prescripciones: {
    id: number;
    nombre: string;
    indicaciones: string;
  }[];

  files: {
    id: number;
    originalName: string;
    storagePath: string;
    size: number;
    mimeType: string;
  }[];
}