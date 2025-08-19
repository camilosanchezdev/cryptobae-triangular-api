import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TradingPairEntity } from './trading-pair.entity';

@Entity({
  name: 'cryptos',
})
export class CryptoEntity {
  // Basic properties
  @PrimaryGeneratedColumn({ name: 'crypto_id' })
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

  @Column({ type: String, nullable: false })
  name: string;

  @Column({ type: String, nullable: false })
  symbol: string;

  @Column({ type: String, nullable: false })
  type: string; // cryptocoin or stablecoin

  // Relations
  @OneToMany(() => TradingPairEntity, (tradingPair) => tradingPair.baseCrypto)
  baseTradingPairs: TradingPairEntity[];

  @OneToMany(() => TradingPairEntity, (tradingPair) => tradingPair.quoteCrypto)
  quoteTradingPairs: TradingPairEntity[];
}
