import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CryptocurrencyEntity } from './cryptocurrency.entity';

@Entity({
  name: 'prices',
})
export class PriceEntity {
  // Basic properties
  @PrimaryGeneratedColumn({ name: 'price_id' })
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

  @Column({ name: 'price', type: 'decimal', nullable: false })
  price: number;

  @Column({ name: 'volume', type: 'decimal', nullable: true })
  volume: number;

  @Column({ name: 'cryptocurrency_id', type: 'int', nullable: false })
  cryptocurrencyId: number;

  // Relations
  @ManyToOne(
    () => CryptocurrencyEntity,
    (cryptocurrency) => cryptocurrency.prices,
  )
  @JoinColumn({ name: 'cryptocurrency_id' })
  cryptocurrency: CryptocurrencyEntity;
}
