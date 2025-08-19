import { CryptocurrencyEntity } from 'src/features/prices/entities/cryptocurrency.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EvaluationTypeEntity } from './evaluation-type.entity';
import { RecommendedActionEntity } from './recommended-actions.entity';

@Entity({
  name: 'evaluations',
})
export class EvaluationEntity {
  // Basic properties
  @PrimaryGeneratedColumn({ name: 'evaluation_id' })
  id: number;
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt: Date;
  @Column({ type: 'bool', width: 1, default: false })
  deleted: boolean;

  @Column({ name: 'current_price', type: 'decimal', nullable: false })
  currentPrice: number;

  @Column({ name: 'initial_price', type: 'decimal', nullable: true })
  initialPrice: number | null;

  @Column({ name: 'price_difference', type: 'decimal', nullable: true })
  priceDifference: number | null;

  @Column({
    name: 'price_difference_percentage',
    type: 'decimal',
    nullable: true,
  })
  priceDifferencePercentage: number | null;

  @Column({ name: 'cryptocurrency_id', type: 'int', nullable: false })
  cryptocurrencyId: number;

  @Column({ name: 'has_crypto', type: 'bool', width: 1, default: false })
  hasCrypto: boolean;

  @Column({ name: 'min_price_of_day', type: 'decimal', nullable: false })
  minPriceOfDay: number;

  @Column({ name: 'evaluation_type_id', type: 'int', nullable: false })
  evaluationTypeId: number;

  @Column({ name: 'recommended_action_id', type: 'int', nullable: false })
  recommendedActionId: number;

  @Column({ name: 'highest_frame_price', type: 'decimal', nullable: true })
  highestFramePrice: number | null;

  // Relations
  @ManyToOne(
    () => CryptocurrencyEntity,
    (cryptocurrency) => cryptocurrency.evaluations,
  )
  @JoinColumn({ name: 'cryptocurrency_id' })
  cryptocurrency: CryptocurrencyEntity;

  @ManyToOne(
    () => EvaluationTypeEntity,
    (evaluationType) => evaluationType.evaluations,
  )
  @JoinColumn({ name: 'evaluation_type_id' })
  evaluationType: EvaluationTypeEntity;

  @ManyToOne(
    () => RecommendedActionEntity,
    (recommendedAction) => recommendedAction.evaluations,
  )
  @JoinColumn({ name: 'recommended_action_id' })
  recommendedAction: RecommendedActionEntity;
}
