import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { AllExceptionsFilter } from './filters/http-exception.filter';
import { winstonConfig } from './config/winston.config';

async function bootstrap() {
  // Usamos la configuración completa de Winston
  const winstonLogger = WinstonModule.createLogger(winstonConfig);

  const app = await NestFactory.create(AppModule, {
    logger: winstonLogger, // Logger global de NestJS
  });

  // Configura el filtro global de excepciones con el logger de Winston
  app.useGlobalFilters(new AllExceptionsFilter(winstonLogger));

  app.setGlobalPrefix("nutri");
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
  });

  await app.listen(3006);
}
bootstrap();