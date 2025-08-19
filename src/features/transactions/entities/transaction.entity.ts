import { OrderEntity } from 'src/features/orders/entities/order.entity';
import { CryptocurrencyEntity } from 'src/features/prices/entities/cryptocurrency.entity';
import { VaultMovementEntity } from 'src/features/vaults/entities/vault-movement.entity';
import { WalletEntity } from 'src/features/wallets/entities/wallet.entity';
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
import { TransactionTypeEntity } from './transaction-type.entity';

@Entity({
  name: 'transactions',
})
export class TransactionEntity {
  // Basic properties
  @PrimaryGeneratedColumn({ name: 'transaction_id' })
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
  amount: number; // Amount of the transaction in the cryptocurrency's unit

  @Column({ name: 'price_per_unit', type: 'decimal', nullable: true })
  pricePerUnit: number; // Price per unit of the cryptocurrency in the transaction in USDT

  @Column({ name: 'status', type: String, nullable: false })
  status: string; // Status of the transaction (e.g., 'FILLED', 'PARTIALLY_FILLED', 'CANCELED')

  @Column({ name: 'cryptocurrency_id', type: 'int', nullable: true })
  cryptocurrencyId: number;

  @Column({ name: 'transaction_type_id', type: 'int', nullable: false })
  transactionTypeId: number;

  @Column({ name: 'wallet_id', type: 'int', nullable: true })
  walletId: number;

  @Column({ name: 'result', type: String, nullable: true })
  result: string; // Result of the transaction, if applicable (e.g., 'PROFIT', 'LOSS', 'BREAK_EVEN')

  @Column({ name: 'profit', type: 'decimal', nullable: true })
  profit: number;

  // Relations
  @ManyToOne(
    () => CryptocurrencyEntity,
    (cryptocurrency) => cryptocurrency.evaluations,
  )
  @JoinColumn({ name: 'cryptocurrency_id' })
  cryptocurrency: CryptocurrencyEntity;

  @ManyToOne(
    () => TransactionTypeEntity,
    (transactionType) => transactionType.transactions,
  )
  @JoinColumn({ name: 'transaction_type_id' })
  transactionType: TransactionTypeEntity;

  @ManyToOne(() => WalletEntity, (wallet) => wallet.transactions)
  @JoinColumn({ name: 'wallet_id' })
  wallet: WalletEntity;

  @OneToMany(() => OrderEntity, (order) => order.transaction)
  orders: OrderEntity[];

  @OneToMany(() => VaultMovementEntity, (movement) => movement.transaction)
  vaultMovements: VaultMovementEntity[];
}
