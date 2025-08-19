import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { CreateBuyOrderDto } from './dtos/create-buy-order.dto';
import { CreateSellOrderDto } from './dtos/create-sell-order.dto';
import { OrderTypeEntity } from './entities/order-type.entity';
import { OrderEntity } from './entities/order.entity';
import { OrderTypesEnum } from './enums/order-types.enum';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly repository: Repository<OrderEntity>,
    @InjectRepository(OrderTypeEntity)
    private readonly orderTypeRepository: Repository<OrderTypeEntity>,
  ) {}

  async createBuyOrder(createBuyOrderDto: CreateBuyOrderDto) {
    const order = this.repository.create({
      ...createBuyOrderDto,
      orderTypeId: OrderTypesEnum.BUY,
    });
    return this.repository.save(order);
  }
  async createSellOrder(createSellOrderDto: CreateSellOrderDto) {
    const order = this.repository.create({
      ...createSellOrderDto,
      orderTypeId: OrderTypesEnum.SELL,
    });
    return this.repository.save(order);
  }

  async getOrderTypes() {
    return this.orderTypeRepository.find({
      where: {
        deleted: false,
      },
      select: {
        id: true,
        name: true,
      },
    });
  }
  async getOrders(orderTypeId: number | undefined, page: number = 1) {
    const pageSize = 10;
    const currentPage: number = Number(page);
    const where: FindOptionsWhere<OrderEntity> = {
      ...(orderTypeId && {
        orderTypeId,
      }),
    };

    const skip = (currentPage - 1) * pageSize;
    const data = await this.repository.find({
      skip,
      take: pageSize,
      order: { createdAt: 'DESC' },
      relations: ['orderType'],
      where,
    });
    const total = await this.repository.count({ where });

    return {
      page: currentPage,
      pageSize,
      total,
      data,
    };
  }
}
