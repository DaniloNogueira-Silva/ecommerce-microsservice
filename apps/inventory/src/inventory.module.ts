import { ConfigModule } from '@nestjs/config';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { Module } from '@nestjs/common';
import Redis from 'ioredis';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [InventoryController],
  providers: [
    InventoryService,
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        return new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
      },
    },
  ],
})
export class InventoryModule {}