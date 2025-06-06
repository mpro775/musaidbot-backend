import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.enableCors({
    origin: process.env.FRONTEND_ORIGIN || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });
  app.setGlobalPrefix('api');

  // Rate Limiting: 60 طلب/دقيقة لكل IP
  app.use(
    rateLimit({
      windowMs: 60 * 1000,
      max: 60,
    }),
  );

  // ValidationPipe لفرض DTO Validation
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );
  const config = new DocumentBuilder()
    .setTitle('MusaidBot API')
    .setDescription('API documentation for MusaidBot')
    .setVersion('1.0')
    .addBearerAuth() // لدعم توكن JWT في Swagger
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  const port = process.env.PORT || 5000;
  await app.listen(port);
  console.log(`🚀 Backend running on http://localhost:${port}/api`);
}
bootstrap();
