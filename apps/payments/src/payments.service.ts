import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @Inject('PAYMENTS_SERVICE_CLIENT')
    private readonly rabbitClient: ClientProxy,
  ) {}

  async processPayment(order: any) {
    this.logger.log(
      `Recebido evento 'order_created'. Processando pagamento para o pedido:`,
      order,
    );

    // --- Lógica de Integração com o Stripe (Simulada por enquanto) ---
    // 1. Chamar a API do Stripe para criar um PaymentIntent.
    // 2. Aguardar o webhook de confirmação do Stripe.
    // Para simplificar agora, vamos simular um pagamento bem-sucedido.
    const isPaymentSuccessful = true;

    if (isPaymentSuccessful) {
      this.logger.log(
        'Pagamento bem-sucedido. Emitindo evento "payment_processed"...',
      );

      // Emite o evento para a próxima etapa da saga
      this.rabbitClient.emit('payment_processed', {
        ...order,
        paymentDate: new Date(),
      });
    } else {
      this.logger.error('Falha no pagamento.');
      // Aqui você poderia emitir um evento 'payment_failed'
    }
  }
}
