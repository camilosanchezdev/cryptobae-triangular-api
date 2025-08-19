import { ArbitrageOpportunityEntity } from 'src/features/arbitrage-opportunities/entities/arbitrage-opportunity.entity';
import { TransactionEntity } from 'src/features/transactions/entities/transaction.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CryptoEntity } from './crypto.entity';
import { MarketDataEntity } from './market-data.entity';

@Entity({
  name: 'trading_pairs',
})
export class TradingPairEntity {
  // Basic properties
  @PrimaryGeneratedColumn({ name: 'trading_pair_id' })
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

  @Column({ name: 'pair_symbol', type: String, nullable: false })
  pairSymbol: string;

  @Column({ name: 'base_crypto_id', type: 'int', nullable: false })
  baseCryptoId: number;

  @ManyToOne(() => CryptoEntity)
  @JoinColumn({ name: 'base_crypto_id' })
  baseCrypto: CryptoEntity;

  @Column({ name: 'quote_crypto_id', type: 'int', nullable: false })
  quoteCryptoId: number;

  @ManyToOne(() => CryptoEntity)
  @JoinColumn({ name: 'quote_crypto_id' })
  quoteCrypto: CryptoEntity;

  @OneToMany(() => MarketDataEntity, (marketData) => marketData.tradingPair)
  marketData: MarketDataEntity[];

  @OneToMany(() => TransactionEntity, (transaction) => transaction.tradingPair)
  transactions: TransactionEntity[];

  @OneToMany(
    () => ArbitrageOpportunityEntity,
    (arbitrageOpportunity) => arbitrageOpportunity.firstTradingPair,
  )
  firstArbitrageOpportunities: ArbitrageOpportunityEntity[];

  @OneToMany(
    () => ArbitrageOpportunityEntity,
    (arbitrageOpportunity) => arbitrageOpportunity.secondTradingPair,
  )
  secondArbitrageOpportunities: ArbitrageOpportunityEntity[];

  @OneToMany(
    () => ArbitrageOpportunityEntity,
    (arbitrageOpportunity) => arbitrageOpportunity.thirdTradingPair,
  )
  thirdArbitrageOpportunities: ArbitrageOpportunityEntity[];
}
