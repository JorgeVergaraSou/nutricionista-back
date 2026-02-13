export enum EstadoTurno {
  PENDIENTE = "PENDIENTE",       // creado pero no confirmado
  CONFIRMADO = "CONFIRMADO",     // confirmado por paciente
  CANCELADO = "CANCELADO",       // cancelado anticipadamente
  NO_ASISTIO = "NO_ASISTIO",     // paciente no vino
  ATENDIDO = "ATENDIDO",         // se realizó la consulta
}
