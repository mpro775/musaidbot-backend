// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { Logger as PinoLogger } from 'nestjs-pino';

async function bootstrap() {
  // أولًا: إنشاء تطبيق Nest
  const app = await NestFactory.create(AppModule);

  // إذا رغبت بإضافة Integration جديد برمجيًا بعد التهيئة:
  // const hub = getCurrentHub();
  // const client = hub.getClient();
  // client?.addIntegration(new Tracing.Integrations.Express({ app: app.getHttpServer() }));

  // ———————————————————————————————————————————————
  // إضافة Helmet للحماية الأساسية
  app.use(helmet());

  // تفعيل CORS للسماح للفرونت أند بالاتصال
  app.enableCors({
    origin: process.env.FRONTEND_ORIGIN || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });

  // تفعيل Rate Limiting: 60 طلب/دقيقة
  app.use(
    rateLimit({
      windowMs: 60 * 1000,
      max: 60,
    }),
  );

  // تفعيل ValidationPipe عالميًّا
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );
  app.useLogger(app.get(PinoLogger));

  // إضافة LoggingInterceptor لتسجيل معلومات الطلب
  app.useGlobalInterceptors(new LoggingInterceptor());

  // إعداد Swagger
  const config = new DocumentBuilder()
    .setTitle('MusaidBot API')
    .setDescription('API documentation for MusaidBot')
    .setVersion('1.0')
    .addBearerAuth() // لدعم JWT في واجهة Swagger
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  const shutdownSignals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];

  shutdownSignals.forEach((signal) =>
    process.on(signal, () => {
      console.log(`\n💤 Received ${signal}, shutting down gracefully...`);
      // لا تُرجع promise داخل المصغرة؛ استخدم then()
      app
        .close()
        .then(() => {
          console.log('✅ HTTP server closed.');
          process.exit(0);
        })
        .catch((err) => {
          console.error('❌ Error during shutdown', err);
          process.exit(1);
        });
    }),
  );

  app.use(
    '/api/whatsapp/reply',
    rateLimit({
      windowMs: 1000, // 1 ثانية
      max: 20, // 20 طلب/ثانية
    }),
  );

  // تشغيل الخادم
  const port = process.env.PORT || 5000;
  await app.listen(port);
  console.log(`🚀 Backend running on http://localhost:${port}/api`);
}

bootstrap();
