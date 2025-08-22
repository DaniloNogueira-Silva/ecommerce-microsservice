import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [NotificationsController],
  providers: [NotificationsService],
})
export class NotificationsModule {}
