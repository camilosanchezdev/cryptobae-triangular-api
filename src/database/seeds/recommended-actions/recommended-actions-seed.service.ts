import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RecommendedActionEntity } from 'src/features/evaluations/entities/recommended-actions.entity';
import { Repository } from 'typeorm';
import { RecommendedActionEnum } from '../../../features/evaluations/enums/recommended-action.enum';

@Injectable()
export class RecommendedActionsSeedService {
  constructor(
    @InjectRepository(RecommendedActionEntity)
    private repository: Repository<RecommendedActionEntity>,
  ) {}

  async run() {
    const elements = [
      {
        id: RecommendedActionEnum.BUY,
        name: 'BUY',
      },
      {
        id: RecommendedActionEnum.SELL,
        name: 'SELL',
      },
      {
        id: RecommendedActionEnum.NO_ACTION,
        name: 'NO_ACTION',
      },
      {
        id: RecommendedActionEnum.MARK_AS_LONG_TERM,
        name: 'MARK_AS_LONG_TERM',
      },
    ];
    const count = await this.repository.count();
    if (count > 0) {
      return;
    }
    // Insert with specific IDs
    for (const element of elements) {
      await this.repository.save(
        this.repository.create({
          id: element.id,
          name: element.name,
        }),
      );
    }
  }
}
