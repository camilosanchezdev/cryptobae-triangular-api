import { EvaluationSellEntity } from 'src/features/evaluations/entities/evaluations-sell.entity';
import { CryptocurrencyEntity } from 'src/features/prices/entities/cryptocurrency.entity';
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
import { WalletStatusEntity } from './wallet-status.entity';
import { WalletTypeEntity } from './wallet-type.entity';

@Entity({
  name: 'wallets',
})
export class WalletEntity {
  // Basic properties
  @PrimaryGeneratedColumn({ name: 'wallet_id' })
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

  @Column({ name: 'amount', type: 'decimal', nullable: false })
  amount: number;

  @Column({ name: 'initial_price', type: 'decimal', nullable: false })
  initialPrice: number;

  @Column({ name: 'highest_frame_price', type: 'decimal', nullable: true })
  highestFramePrice: number;

  @Column({ name: 'cryptocurrency_id', type: 'int', nullable: false })
  cryptocurrencyId: number;

  @Column({ name: 'wallet_type_id', type: 'int', nullable: false })
  walletTypeId: number;

  @Column({ name: 'wallet_status_id', type: 'int', nullable: true })
  walletStatusId: number;
  // Relations
  @ManyToOne(
    () => CryptocurrencyEntity,
    (cryptocurrency) => cryptocurrency.evaluations,
  )
  @JoinColumn({ name: 'cryptocurrency_id' })
  cryptocurrency: CryptocurrencyEntity;
  @ManyToOne(() => WalletTypeEntity, (walletType) => walletType.wallets)
  @JoinColumn({ name: 'wallet_type_id' })
  walletType: WalletTypeEntity;

  @OneToMany(() => TransactionEntity, (transaction) => transaction.wallet)
  transactions: TransactionEntity[];

  @OneToMany(() => EvaluationSellEntity, (evaluation) => evaluation.wallet)
  evaluations: EvaluationSellEntity[];

  @ManyToOne(() => WalletStatusEntity, (walletStatus) => walletStatus.wallets)
  @JoinColumn({ name: 'wallet_status_id' })
  walletStatus: WalletStatusEntity;
}
