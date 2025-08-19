import { CryptoEntity } from 'src/features/cryptos/entities/crypto.entity';
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

  // For triangular arbitrage: Start Stablecoin -> Mid Crypto -> End Crypto -> End Stablecoin
  // cycleStartCrypto = Starting stablecoin (e.g., DAI)
  // midCrypto = First intermediate crypto (e.g., ETH)
  // secondMidCrypto = Second intermediate crypto (e.g., BTC)
  // endCrypto = Final stablecoin (e.g., TUSD)
  @Column({ name: 'cycle_start_crypto_id', type: 'int', nullable: false })
  cycleStartCryptoId: number;

  @ManyToOne(() => CryptoEntity)
  @JoinColumn({ name: 'cycle_start_crypto_id' })
  cycleStartCrypto: CryptoEntity;

  @Column({ name: 'mid_crypto_id', type: 'int', nullable: false })
  midCryptoId: number;

  @ManyToOne(() => CryptoEntity)
  @JoinColumn({ name: 'mid_crypto_id' })
  midCrypto: CryptoEntity;

  @Column({ name: 'second_mid_crypto_id', type: 'int', nullable: false })
  secondMidCryptoId: number;

  @ManyToOne(() => CryptoEntity)
  @JoinColumn({ name: 'second_mid_crypto_id' })
  secondMidCrypto: CryptoEntity;

  @Column({ name: 'end_crypto_id', type: 'int', nullable: false })
  endCryptoId: number;

  @ManyToOne(() => CryptoEntity)
  @JoinColumn({ name: 'end_crypto_id' })
  endCrypto: CryptoEntity;
}
