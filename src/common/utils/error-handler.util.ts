// src/common/utils/error-handler.util.ts
import {
  InternalServerErrorException,
  HttpException,
  LoggerService,
} from '@nestjs/common';
import {
  QueryFailedError,
  EntityNotFoundError,
  TypeORMError,
} from 'typeorm';

/**
 * Maneja errores internos de servicios de forma consistente,
 * los loguea con Winston y arroja una excepción adecuada para NestJS.
 */
export function handleServiceError(
  error: unknown,
  logger: LoggerService,
  serviceName: string,
  defaultMessage: string,
): never {
  // Log detallado
  logger.error(
    `[${serviceName}] Error: ${error instanceof Error ? error.message : error}`,
    (error as any)?.stack || undefined,
  );

  // Si ya es una HttpException → no la envuelvo de nuevo
  if (error instanceof HttpException) {
    throw error;
  }

  // Errores SQL directos de TypeORM
  if (error instanceof QueryFailedError) {
    const message = `Error SQL: ${(error as any).message}`;
    throw new InternalServerErrorException(message);
  }

  // Entidad no encontrada
  if (error instanceof EntityNotFoundError) {
    const message = `Entidad no encontrada: ${(error as any).message}`;
    throw new InternalServerErrorException(message);
  }

  // Cualquier otro error interno de TypeORM
  if (error instanceof TypeORMError) {
    const message = `Error de TypeORM: ${error.message}`;
    throw new InternalServerErrorException(message);
  }

  // Fallback genérico
  throw new InternalServerErrorException(defaultMessage);
}
