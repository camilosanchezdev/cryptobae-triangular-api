import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderTypeEntity } from 'src/features/orders/entities/order-type.entity';
import { OrderTypesEnum } from 'src/features/orders/enums/order-types.enum';
import { Repository } from 'typeorm';

@Injectable()
export class OrderTypesSeedService {
  constructor(
    @InjectRepository(OrderTypeEntity)
    private repository: Repository<OrderTypeEntity>,
  ) {}

  async run() {
    const elements = [
      {
        id: OrderTypesEnum.BUY,
        name: 'BUY',
      },
      {
        id: OrderTypesEnum.SELL,
        name: 'SELL',
      },
    ];
    const count = await this.repository.count();
    if (count > 0) {
      return;
    }
    // Insert with specific IDs
    for (const element of elements) {
      await this.repository.save(this.repository.create({ ...element }));
    }
  }
}
