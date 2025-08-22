import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    // Injeta os dois clientes com seus nomes únicos
    @Inject('INVENTORY_SERVICE_CLIENT')
    private readonly inventoryClient: ClientProxy,
    @Inject('NOTIFICATIONS_SERVICE_CLIENT')
    private readonly notificationsClient: ClientProxy,
  ) {}

  async processPayment(order: any) {
    this.logger.log(`Processando pagamento para o pedido:`, order);
    const isPaymentSuccessful = true;

    if (isPaymentSuccessful) {
      this.logger.log('Pagamento bem-sucedido. Emitindo eventos...');

      const eventPayload = { ...order, paymentDate: new Date() };

      this.inventoryClient.emit('payment_processed_inventory', eventPayload);

      this.notificationsClient.emit(
        'payment_processed_notification',
        eventPayload,
      );
    }
  }
}
