import { NestFactory } from '@nestjs/core';
import { OrdersModule } from './orders.module';
import { ValidationPipe } from '@nestjs/common';
import { initTracing } from './instrument';

async function bootstrap() {
  await initTracing();

  const app = await NestFactory.create(OrdersModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.port ?? 3001);
}
bootstrap();
