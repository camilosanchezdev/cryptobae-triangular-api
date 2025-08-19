import { CryptocurrencyEntity } from 'src/features/prices/entities/cryptocurrency.entity';
import { WalletEntity } from 'src/features/wallets/entities/wallet.entity';
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
  name: 'evaluations_sell',
})
export class EvaluationSellEntity {
  // Basic properties
  @PrimaryGeneratedColumn({ name: 'evaluation_sell_id' })
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

  @Column({ name: 'initial_price', type: 'decimal', nullable: false })
  initialPrice: number | null;

  @Column({ name: 'price_difference', type: 'decimal', nullable: false })
  priceDifference: number | null;

  @Column({
    name: 'price_difference_percentage',
    type: 'decimal',
    nullable: false,
  })
  priceDifferencePercentage: number | null;

  @Column({ name: 'highest_frame_price', type: 'decimal', nullable: false })
  highestFramePrice: number;

  @Column({ name: 'recommended_action_id', type: 'int', nullable: false })
  recommendedActionId: number;

  // Relations
  @Column({ name: 'cryptocurrency_id', type: 'int', nullable: false })
  cryptocurrencyId: number;

  @Column({ name: 'wallet_id', type: 'int', nullable: true })
  walletId: number;

  @ManyToOne(() => WalletEntity, (wallet) => wallet.evaluations)
  @JoinColumn({ name: 'wallet_id' })
  wallet: WalletEntity;

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
