import * as request from 'supertest';

import { ClientsModule, Transport } from '@nestjs/microservices';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';

import { Order } from '../src/entities/order.entity';
import { OrdersController } from '../src/orders.controller';
import { OrdersService } from '../src/orders.service';

describe('OrdersController (Integration)', () => {
  let app: INestApplication;
  let postgresContainer: StartedPostgreSqlContainer;
  let orderRepository; 

  // antes de TODOS os testes, iniciamos o contêiner do PostgreSQL
  beforeAll(async () => {
    postgresContainer = await new PostgreSqlContainer('postgres:15').start();
  }, 30000);

  // depois de TODOS os testes, paramos e destruímos o contêiner
  afterAll(async () => {
    await postgresContainer.stop();
  }, 15000);

  // antes de CADA teste, criamos uma nova instância da aplicação
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        // Usamos o TypeOrmModule para conectar ao banco de dados temporário
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: postgresContainer.getHost(),
          port: postgresContainer.getPort(),
          username: postgresContainer.getUsername(),
          password: postgresContainer.getPassword(),
          database: postgresContainer.getDatabase(),
          entities: [Order],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Order]),

        // Precisamos mockar o cliente RabbitMQ, pois não queremos emitir
        // eventos reais durante este teste de integração de banco de dados.
        ClientsModule.register([
          {
            name: 'ORDERS_SERVICE_CLIENT',
            transport: Transport.RMQ,
            options: {
              urls: ['amqp://guest:guest@localhost:5672'],
              queue: 'test_queue',
            },
          },
        ]),
      ],
      controllers: [OrdersController],
      providers: [OrdersService],
    })
      // Sobrescrevemos o provider do RabbitMQ para usar um mock simples
      .overrideProvider('ORDERS_SERVICE_CLIENT')
      .useValue({
        emit: jest.fn(),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    orderRepository = moduleFixture.get(getRepositoryToken(Order));
  });

  afterEach(async () => {
    await app.close();
  });

  it('should create an order successfully via POST /orders', async () => {
    const createOrderDto = { userId: 'user-integration-test', total: 250.75 };

    const response = await request(app.getHttpServer())
      .post('/orders')
      .send(createOrderDto)
      .expect(201); 

    expect(response.body).toBeDefined();
    expect(response.body.userId).toEqual(createOrderDto.userId);
    expect(parseFloat(response.body.total)).toEqual(createOrderDto.total);
    expect(response.body.id).toBeDefined();

    const savedOrder = await orderRepository.findOneBy({
      id: response.body.id,
    });
    expect(savedOrder).toBeDefined();
    expect(savedOrder.userId).toEqual(createOrderDto.userId);
  }, 20000);
});
