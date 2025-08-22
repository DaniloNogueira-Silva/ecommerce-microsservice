// apps/payments/src/payments.module.ts

import { ClientsModule, Transport } from '@nestjs/microservices';

import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // Registra um array com DOIS clientes, um para cada destino
    ClientsModule.register([
      {
        name: 'INVENTORY_SERVICE_CLIENT', // Nome único para injeção
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL!],
          queue: 'inventory_queue', // Fila de destino
          queueOptions: {
            durable: true,
          },
        },
      },
      {
        name: 'NOTIFICATIONS_SERVICE_CLIENT', // Nome único para injeção
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL!],
          queue: 'notifications_queue', // Fila de destino
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
