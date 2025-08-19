import { OrderEntity } from 'src/features/orders/entities/order.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
// import { ConfigurationLogEntity } from './configurations-log.entity';

@Entity({
  name: 'fees',
})
export class FeeEntity {
  // Basic properties
  @PrimaryGeneratedColumn({ name: 'fee_id' })
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

  @Column({ name: 'amount', type: 'decimal', nullable: true })
  amount: string;

  // Relations

  @OneToOne(() => OrderEntity, (order) => order.fee)
  @JoinColumn({ name: 'order_id', referencedColumnName: 'id' })
  order: OrderEntity;

  @Column({ name: 'order_id', type: 'int', nullable: true, unique: true })
  orderId: number;
}
