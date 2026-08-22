import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable shutdown hooks so onModuleDestroy in PrismaService and other providers is called
  app.enableShutdownHooks();

  // Enable validation pipe globally for class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // CRITICAL: Enable CORS so your React app on port 5173 can talk to this API
  app.enableCors();

  // Set up Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('Dayflow HRMS API')
    .setDescription('The API backend for our 8-hour hackathon')
    .setVersion('1.0')
    .addBearerAuth() // Let's you pass the JWT token in the Swagger UI later
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // The docs will be available at http://localhost:3000/api-docs
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(3000);
}
bootstrap();