import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { PaymentsService } from './payments.service';

@Controller()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @EventPattern('order_created')
  handleOrderCreated(@Payload() order: any) {
    this.paymentsService.processPayment(order);
  }
}