import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecommendedActionEntity } from 'src/features/evaluations/entities/recommended-actions.entity';
import { RecommendedActionsSeedService } from './recommended-actions-seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([RecommendedActionEntity])],
  providers: [RecommendedActionsSeedService],
  exports: [RecommendedActionsSeedService],
})
export class RecommendedActionsSeedModule {}
