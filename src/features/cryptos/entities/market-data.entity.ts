import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TradingPairEntity } from './trading-pair.entity';

@Entity({
  name: 'market_data',
})
export class MarketDataEntity {
  // Basic properties
  @PrimaryGeneratedColumn({ name: 'market_data_id' })
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

  @Column({ name: 'bid_price', type: 'decimal', nullable: false })
  bidPrice: number;

  @Column({ name: 'ask_price', type: 'decimal', nullable: false })
  askPrice: number;

  @Column({ name: 'volume', type: 'decimal', nullable: false })
  volume: number;

  // Relations
  @Column({ name: 'trading_pair_id', type: 'int', nullable: false })
  tradingPairId: number;

  @ManyToOne(() => TradingPairEntity)
  @JoinColumn({ name: 'trading_pair_id' })
  tradingPair: TradingPairEntity;
}
