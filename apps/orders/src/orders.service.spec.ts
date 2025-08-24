import { Test, TestingModule } from '@nestjs/testing';

import { ClientProxy } from '@nestjs/microservices';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './entities/order.entity';
import { OrdersService } from './orders.service';
import { getRepositoryToken } from '@nestjs/typeorm';

// Descreve o conjunto de testes para o OrdersService
describe('OrdersService', () => {
  let service: OrdersService;
  // Criamos tipos para nossos mocks para ter autocomplete e checagem de tipo
  let mockOrderRepository: { create: jest.Mock; save: jest.Mock };
  let mockRabbitClient: { emit: jest.Mock };

  beforeEach(async () => {
    // Criamos os objetos mock com as funções que vamos espionar
    mockOrderRepository = {
      create: jest.fn(),
      save: jest.fn(),
    };
    mockRabbitClient = {
      emit: jest.fn(),
    };

    // Cria um módulo de teste do NestJS, simulando nosso OrdersModule
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          // Quando o OrdersService pedir o OrderRepository (via @InjectRepository)...
          provide: getRepositoryToken(Order),
          // ...entregue nosso mock no lugar.
          useValue: mockOrderRepository,
        },
        {
          // Quando o OrdersService pedir o ClientProxy (via @Inject)...
          provide: 'ORDERS_SERVICE_CLIENT',
          // ...entregue nosso outro mock no lugar.
          useValue: mockRabbitClient,
        },
      ],
    }).compile();

    // Obtém uma instância do OrdersService com as dependências mockadas
    service = module.get<OrdersService>(OrdersService);
  });

  it('should create an order and emit an event', async () => {
    // --- 1. Arrange (Arrumar) ---
    // Prepara os dados de entrada e o que esperamos que os mocks retornem
    const createOrderDto: CreateOrderDto = { userId: '123', total: 100 };
    const mockOrder = { id: 'uuid-123', ...createOrderDto, status: 'PENDING' };

    mockOrderRepository.create.mockReturnValue(mockOrder);
    mockOrderRepository.save.mockResolvedValue(mockOrder);

    // --- 2. Act (Agir) ---
    // Executa o método que estamos testando
    const result = await service.createOrder(createOrderDto);

    // --- 3. Assert (Verificar) ---
    // Verifica se tudo aconteceu como esperado

    // Verifica se o método create do repositório foi chamado com os dados corretos
    expect(mockOrderRepository.create).toHaveBeenCalledWith(createOrderDto);

    // Verifica se o método save foi chamado com o objeto que o 'create' retornou
    expect(mockOrderRepository.save).toHaveBeenCalledWith(mockOrder);

    // Verifica se o método emit do cliente RabbitMQ foi chamado com o padrão e payload corretos
    expect(mockRabbitClient.emit).toHaveBeenCalledWith(
      'order_created',
      mockOrder,
    );

    expect(result).toEqual(mockOrder);
  });
});
