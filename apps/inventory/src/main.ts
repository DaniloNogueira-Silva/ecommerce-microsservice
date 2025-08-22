import { InventoryModule } from './inventory.module';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(InventoryModule, {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672'],
      queue: 'inventory_queue',
      queueOptions: {
        durable: true,
      },
    },
  });

  await app.listen();
}
bootstrap();
