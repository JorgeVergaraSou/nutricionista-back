// src/turnos/turnos.service.ts
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { TurnoEntity } from './entities/turno.entity';
import { PatientEntity } from '@/patients/entities/patient.entity';
import { CrearTurnoDto } from './dto/create-turno.dto';
import { ActualizarTurnoDto } from './dto/update-turno.dto';
import { EstadoTurno } from '@/common/enums/estado-turno.enum';

@Injectable()
export class TurnosService {
  constructor(
    @InjectRepository(TurnoEntity)
    private readonly turnoRepo: Repository<TurnoEntity>,

    @InjectRepository(PatientEntity)
    private readonly pacienteRepo: Repository<PatientEntity>,
  ) { }

  async crear(dto: CrearTurnoDto) {
    const paciente = await this.pacienteRepo.findOne({
      where: { id: dto.pacienteId },
    });

    if (!paciente) {
      throw new NotFoundException('Paciente no encontrado');
    }

    const existe = await this.turnoRepo.findOne({
      where: { fecha: dto.fecha, hora: dto.hora },
    });

    if (existe) {
      throw new ConflictException('Ya existe un turno en ese horario');
    }

    const turno = this.turnoRepo.create({
      ...dto,
      paciente,
    });

    return this.turnoRepo.save(turno);
  }

  async buscarPorFecha(fecha: string) {
    return this.turnoRepo.find({
      where: [
        { fecha, estado: EstadoTurno.PENDIENTE },
        { fecha, estado: EstadoTurno.CONFIRMADO },
      ],
      order: { hora: 'ASC' },
    });
  }

  async obtenerPorId(id: number) {
    const turno = await this.turnoRepo.findOne({
      where: { id },
      relations: ['paciente'],
    });

    if (!turno) {
      throw new NotFoundException('Turno no encontrado');
    }

    return turno;
  }

  async actualizar(id: number, dto: ActualizarTurnoDto) {
    const turno = await this.turnoRepo.findOne({ where: { id } });

    if (!turno) {
      throw new NotFoundException('Turno no encontrado');
    }

    if (dto.fecha && dto.hora) {
      const conflicto = await this.turnoRepo.findOne({
        where: { fecha: dto.fecha, hora: dto.hora },
      });

      if (conflicto && conflicto.id !== id) {
        throw new ConflictException('Horario ya ocupado');
      }
    }

    Object.assign(turno, dto);
    return this.turnoRepo.save(turno);
  }

  async eliminar(id: number) {
    const turno = await this.turnoRepo.findOne({ where: { id } });

    if (!turno) {
      throw new NotFoundException('Turno no encontrado');
    }

    await this.turnoRepo.remove(turno);
    return { success: true };
  }

  async marcarNoAsistio(id: number) {
    const turno = await this.turnoRepo.findOne({
      where: { id },
    });

    if (!turno) {
      throw new NotFoundException('Turno no encontrado');
    }

    if (turno.estado === EstadoTurno.ATENDIDO) {
      throw new BadRequestException(
        'No se puede marcar como no asistido un turno ya atendido',
      );
    }

    turno.estado = EstadoTurno.NO_ASISTIO;

    return this.turnoRepo.save(turno);
  }

 async obtenerHistorial(
  desde?: string,
  hasta?: string,
) {
  try {
    const where: any = {};

    // 🔹 Filtro dinámico por fechas
    if (desde && hasta) {
      where.fecha = Between(desde, hasta);
    } else if (desde) {
      where.fecha = MoreThanOrEqual(desde);
    } else if (hasta) {
      where.fecha = LessThanOrEqual(hasta);
    }

    return await this.turnoRepo.find({
      where,
      relations: ['paciente'], // 👈 trae nombre y apellido
      order: {
        fecha: 'DESC',
        hora: 'DESC',
      },
    });

  } catch (error) {
    console.error('🔥 ERROR obtenerHistorial:', error);
    throw error;
  }
}

}
