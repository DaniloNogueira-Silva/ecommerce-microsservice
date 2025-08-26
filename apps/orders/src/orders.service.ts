import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @Inject('ORDERS_SERVICE_CLIENT')
    private readonly rabbitClient: ClientProxy,
    @InjectMetric('orders_created_total')
    private readonly ordersCreatedCounter: Counter<string>,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    const newOrder = this.orderRepository.create(createOrderDto);
    await this.orderRepository.save(newOrder);
    this.logger.log(`new order created: ${JSON.stringify(newOrder)}`);
    this.ordersCreatedCounter.inc();
    this.rabbitClient.emit('order_created', newOrder);
    this.logger.log(`Order emitted: ${JSON.stringify(newOrder)}`);

    return newOrder;
  }
}
