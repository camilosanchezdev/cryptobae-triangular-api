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
import { RecommendedActionEntity } from './recommended-actions.entity';

@Entity({
  name: 'evaluations_buy',
})
export class EvaluationBuyEntity {
  // Basic properties
  @PrimaryGeneratedColumn({ name: 'evaluation_buy_id' })
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

  @Column({ name: 'min_price_yesterday', type: 'decimal', nullable: false })
  minPriceYesterday: number;

  @Column({
    name: 'lowest_price_frame_secondary',
    type: 'decimal',
    nullable: false,
  })
  lowestPriceFrameSecondary: number | null;

  @Column({
    name: 'current_volume',
    type: 'decimal',
    nullable: false,
  })
  currentVolume: number | null;

  @Column({
    name: 'average_volume',
    type: 'decimal',
    nullable: false,
  })
  averageVolume: number | null;

  @Column({ name: 'cryptocurrency_id', type: 'int', nullable: false })
  cryptocurrencyId: number;

  @Column({ name: 'highest_price_frame', type: 'decimal', nullable: false })
  highestPriceFrame: number;

  @Column({ name: 'recommended_action_id', type: 'int', nullable: false })
  recommendedActionId: number;

  @Column({ name: 'average_price_week', type: 'decimal', nullable: true })
  averagePriceWeek: number;

  // Relations
  @ManyToOne(
    () => CryptocurrencyEntity,
    (cryptocurrency) => cryptocurrency.evaluations,
  )
  @JoinColumn({ name: 'cryptocurrency_id' })
  cryptocurrency: CryptocurrencyEntity;

  @ManyToOne(
    () => RecommendedActionEntity,
    (recommendedAction) => recommendedAction.evaluations,
  )
  @JoinColumn({ name: 'recommended_action_id' })
  recommendedAction: RecommendedActionEntity;
}
