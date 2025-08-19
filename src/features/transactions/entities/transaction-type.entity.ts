import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TransactionEntity } from './transaction.entity';

@Entity({
  name: 'transaction_types',
})
export class TransactionTypeEntity {
  // Basic properties
  @PrimaryGeneratedColumn({ name: 'transaction_type_id' })
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

  // Relations
  @OneToMany(
    () => TransactionEntity,
    (transaction) => transaction.transactionType,
  )
  transactions: TransactionEntity[];
}
