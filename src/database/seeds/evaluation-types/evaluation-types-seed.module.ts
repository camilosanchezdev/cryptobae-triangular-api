import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EvaluationTypeEntity } from 'src/features/evaluations/entities/evaluation-type.entity';
import { EvaluationTypesSeedService } from './evaluation-types-seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([EvaluationTypeEntity])],
  providers: [EvaluationTypesSeedService],
  exports: [EvaluationTypesSeedService],
})
export class EvaluationTypesSeedModule {}
