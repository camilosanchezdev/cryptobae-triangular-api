import { TradingPairEntity } from 'src/features/cryptos/entities/trading-pair.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({
  name: 'arbitrage_opportunities',
})
export class ArbitrageOpportunityEntity {
  // Basic properties
  @PrimaryGeneratedColumn({ name: 'arbitrage_opportunity_id' })
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

  @Column({ name: 'is_executed', type: 'bool', width: 1, default: false })
  isExecuted: boolean;

  @Column({ name: 'profit_percentage', type: 'decimal', nullable: false })
  profitPercentage: number;

  @Column({ name: 'ask_price_1', type: 'decimal', nullable: false })
  askPrice1: number;

  @Column({ name: 'ask_price_2', type: 'decimal', nullable: false })
  askPrice2: number;

  @Column({ name: 'bid_price', type: 'decimal', nullable: false })
  bidPrice: number;

  @Column({ name: 'min_profit_percent', type: 'decimal', nullable: false })
  minProfitPercent: number;

  @Column({ name: 'first_trading_pair_id', type: 'int', nullable: false })
  firstTradingPairId: number;

  @ManyToOne(() => TradingPairEntity)
  @JoinColumn({ name: 'first_trading_pair_id' })
  firstTradingPair: TradingPairEntity;

  @Column({ name: 'second_trading_pair_id', type: 'int', nullable: false })
  secondTradingPairId: number;

  @ManyToOne(() => TradingPairEntity)
  @JoinColumn({ name: 'second_trading_pair_id' })
  secondTradingPair: TradingPairEntity;

  @Column({ name: 'third_trading_pair_id', type: 'int', nullable: false })
  thirdTradingPairId: number;

  @ManyToOne(() => TradingPairEntity)
  @JoinColumn({ name: 'third_trading_pair_id' })
  thirdTradingPair: TradingPairEntity;
}
