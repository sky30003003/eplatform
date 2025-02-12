import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Security middleware
  app.use(helmet());
  app.use(cookieParser());
  
  // CORS configuration
  const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    ...(process.env.ADDITIONAL_ORIGINS ? process.env.ADDITIONAL_ORIGINS.split(',') : [])
  ];
  
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    exposedHeaders: ['Authorization'],
  });
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true
  }));

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
