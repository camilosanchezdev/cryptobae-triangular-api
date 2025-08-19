import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EvaluationTypeEntity } from 'src/features/evaluations/entities/evaluation-type.entity';
import { Repository } from 'typeorm';
import { EvaluationTypeEnum } from '../../../features/evaluations/enums/evaluation-type.enum';

@Injectable()
export class EvaluationTypesSeedService {
  constructor(
    @InjectRepository(EvaluationTypeEntity)
    private repository: Repository<EvaluationTypeEntity>,
  ) {}

  async run() {
    const elements = [
      {
        id: EvaluationTypeEnum.BUY_CHECK,
        name: 'BUY_CHECK',
      },
      {
        id: EvaluationTypeEnum.SELL_CHECK,
        name: 'SELL_CHECK',
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
