import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS
  app.enableCors({
    origin: 'http://localhost:8081', // Permitir solo este origen, para permitir todos los origenes '*'
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Métodos permitidos
    allowedHeaders: 'Content-Type, Authorization', // Headers permitidos
    credentials: true, // Si necesitas enviar cookies o autenticación
  });

  // Habilitar validación global
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(3001);
}
bootstrap();
