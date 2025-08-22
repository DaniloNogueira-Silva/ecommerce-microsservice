import { Inject, Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);
  private readonly PROCESSED_ORDERS_SET = 'processed_orders';

  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {}

  async updateStock(order: any) {
    this.logger.log(`Recebido evento 'payment_processed' para o pedido: ${order.id}`);

    const isProcessed = await this.redisClient.sismember(this.PROCESSED_ORDERS_SET, order.id);

    if (isProcessed) {
      this.logger.warn(`Pedido ${order.id} já foi processado. Ignorando.`);
      return;
    }

    const productKey = 'product:123:stock';
    const currentStock = await this.redisClient.decr(productKey);

    this.logger.log(`Estoque do produto atualizado para: ${currentStock}`);

    await this.redisClient.sadd(this.PROCESSED_ORDERS_SET, order.id);

    this.logger.log(`Pedido ${order.id} marcado como processado.`);
  }
}