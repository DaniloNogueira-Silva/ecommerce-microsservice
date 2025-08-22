import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class NotificationsController {
  private readonly logger = new Logger(NotificationsController.name);

  @EventPattern('payment_processed_notification')
  handlePaymentProcessed(@Payload() order: any) {
    this.logger.log(
      `[NOTIFICATIONS-SERVICE] Evento 'payment_processed_notification' recebido! Pedido ID: ${order.id}`,
    );
  }
}
