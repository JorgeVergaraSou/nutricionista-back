// src/app.module.ts
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './config/winston.config';
import { AppService } from './app.service';
import { PatientsModule } from './patients/patients.module';
import { TurnosModule } from './turnos/turnos.module';
import { VisitsModule } from './visits/visit.module';
import { PatientFilesModule } from './patient-files/patient-files.module';
import * as path from 'path';
import * as fs from 'fs';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

// Verificar todas las entidades .ts o .js que TypeORM podría estar cargando
const entitiesPath = path.join(__dirname, '/**/*.entity{.ts,.js}');
//console.log('🧩 Cargando entidades desde:', entitiesPath);

// Listar los archivos reales para confirmar
/*
const entitiesDir = path.join(__dirname);
function listEntityFiles(dir: string) {
  fs.readdirSync(dir).forEach((file) => {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) listEntityFiles(full);
    else if (file.endsWith('.entity.ts') || file.endsWith('.entity.js'))
      console.log('📄 Entity detectada:', full);
  });
}
listEntityFiles(entitiesDir);*/



@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    WinstonModule.forRoot(winstonConfig),

    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/nutri/uploads',
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService): Promise<TypeOrmModuleOptions> => {
        /* console.log('🔧 Variables de entorno leídas desde .env:');
         console.log({
           DB_TYPE: configService.get('DB_TYPE'),
           DB_HOST: configService.get('DB_HOST'),
           DB_PORT: configService.get('DB_PORT'),
           DB_USERNAME: configService.get('DB_USERNAME'),
           DB_PASSWORD: configService.get('DB_PASSWORD'),
           DB_NAME: configService.get('DB_NAME'),
         });*/

        const ormConfig: TypeOrmModuleOptions = {
          type: 'mysql' as const, // ✅ Tipo literal compatible
          host: configService.get<string>('DB_HOST') || 'localhost',
          port: Number(configService.get<string>('DB_PORT')) || 3306,
          username: configService.get<string>('DB_USERNAME') || 'root',
          password: configService.get<string>('DB_PASSWORD') || '',
          database: configService.get<string>('DB_NAME') || 'test',
          entities: [__dirname + '/**/*.entity{.ts,.js}'],

          synchronize: true,
          // logging: ['query', 'error'],
         // logging: true,
         // logger: 'advanced-console',
          timezone: '-03:00',
          dateStrings: ['DATE'],
          retryAttempts: 1, // 👈 solo 1 intento para ver el error real
          retryDelay: 2000,
        };

        /* console.log('⚙️ Configuración que se enviará a TypeORM:');
         console.log(ormConfig);*/

        return ormConfig;
      },
      inject: [ConfigService],
    }),

    AuthModule,
    PatientsModule,
    TurnosModule,
    VisitsModule,
    PatientFilesModule,
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule {
  constructor() {
    console.log('🚀 AppModule inicializado');
  }
}
