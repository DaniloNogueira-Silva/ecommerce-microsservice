import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { InventoryService } from './inventory.service';

@Controller()
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @EventPattern('payment_processed_inventory')
  handlePaymentProcessed(@Payload() order: any) {
    this.inventoryService.updateStock(order);
  }
}