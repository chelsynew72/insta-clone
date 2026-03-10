import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = NestFactory.create(AppModule);

  // Global prefix for all routes → /api/v1/...
  (await app).setGlobalPrefix('api/v1');

  // Auto-validate all incoming request bodies
  (await app).useGlobalPipes(new ValidationPipe({
    whitelist: true,       // strip unknown fields
    forbidNonWhitelisted: true,
    transform: true,       // auto-convert types
  }));

  // Allow Next.js frontend to call this API
  (await app).enableCors({
    origin: 'http://localhost:3001', // Next.js will run on 3001
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  (await app).listen(port);
  console.log(`API running on http://localhost:${port}/api/v1`);
}
bootstrap();