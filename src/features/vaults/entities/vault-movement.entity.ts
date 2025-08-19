import { TransactionEntity } from 'src/features/transactions/entities/transaction.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MasterVaultEntity } from './master-vault.entity';

@Entity({
  name: 'vault_movements',
})
export class VaultMovementEntity {
  // Basic properties
  @PrimaryGeneratedColumn({ name: 'vault_movement_id' })
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

  @Column({ name: 'old_amount', type: 'decimal', nullable: false })
  oldAmount: number;

  @Column({ name: 'difference', type: 'decimal', nullable: false })
  difference: number;
  // Relationships
  @Column({ name: 'master_vault_id', type: 'int', nullable: false })
  masterVaultId: number;

  @ManyToOne(() => MasterVaultEntity, (masterVault) => masterVault.movements)
  @JoinColumn({ name: 'master_vault_id' })
  masterVault: MasterVaultEntity;

  @Column({ name: 'transaction_id', type: 'int', nullable: false })
  transactionId: number;

  @ManyToOne(
    () => TransactionEntity,
    (transaction) => transaction.vaultMovements,
  )
  @JoinColumn({ name: 'transaction_id' })
  transaction: TransactionEntity;
}
