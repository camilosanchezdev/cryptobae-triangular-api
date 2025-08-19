import { FeeEntity } from 'src/features/fees/entities/fee.entity';
import { TransactionEntity } from 'src/features/transactions/entities/transaction.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrderTypeEntity } from './order-type.entity';

@Entity({
  name: 'orders',
})
export class OrderEntity {
  // Basic properties
  @PrimaryGeneratedColumn({ name: 'order_id' })
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

  @Column({ name: 'symbol', type: String, nullable: true })
  symbol: string;

  @Column({ name: 'external_order_id', type: 'bigint', nullable: true })
  externalOrderId: number;

  @Column({ name: 'order_list_id', type: 'bigint', nullable: true })
  orderListId: number;

  @Column({ name: 'client_order_id', type: String, nullable: true })
  clientOrderId: string;

  @Column({ name: 'transact_time', type: 'bigint', nullable: true })
  transactTime: number;

  @Column({
    name: 'price',
    type: 'decimal',
    nullable: true,
  })
  price: string;
  @Column({
    name: 'orig_qty',
    type: 'decimal',
    nullable: true,
  })
  origQty: string;
  @Column({
    name: 'executed_qty',
    type: 'decimal',
    nullable: true,
  })
  executedQty: string;
  @Column({ name: 'orig_quote_order_qty', type: 'decimal', nullable: true })
  origQuoteOrderQty: string;
  @Column({ name: 'cummulative_quote_qty', type: 'decimal', nullable: true })
  cummulativeQuoteQty: string;
  @Column({ name: 'status', type: String, nullable: true })
  status: string;
  @Column({ name: 'time_in_force', type: String, nullable: true })
  timeInForce: string;
  @Column({ name: 'type', type: String, nullable: true })
  type: string;
  @Column({ name: 'side', type: String, nullable: true })
  side: string;
  @Column({ name: 'working_time', type: 'bigint', nullable: true })
  workingTime: number;
  @Column({ name: 'fills_price', type: 'decimal', nullable: true })
  fillsPrice: string;
  @Column({ name: 'fills_qty', type: 'decimal', nullable: true })
  fillsQty: string;
  @Column({ name: 'fills_commission', type: 'decimal', nullable: true })
  fillsCommission: string;
  @Column({ name: 'fills_commission_asset', type: String, nullable: true })
  fillsCommissionAsset: string;
  @Column({ name: 'fills_trade_id', type: 'bigint', nullable: true })
  fillsTradeId: number;
  @Column({
    name: 'self_trade_prevention_mode',
    type: String,
    nullable: true,
  })
  selfTradePreventionMode: string;

  // Relations
  @Column({ name: 'transaction_id', type: 'int', nullable: true })
  transactionId: number;
  @ManyToOne(() => TransactionEntity, (transaction) => transaction.orders)
  @JoinColumn({ name: 'transaction_id' })
  transaction: TransactionEntity;

  @Column({ name: 'order_type_id', type: 'int', nullable: false })
  orderTypeId: number;
  @ManyToOne(() => OrderTypeEntity, (orderType) => orderType.orders)
  @JoinColumn({ name: 'order_type_id' })
  orderType: OrderTypeEntity;

  @OneToOne(() => FeeEntity, (fee) => fee.order)
  fee: FeeEntity;
}
