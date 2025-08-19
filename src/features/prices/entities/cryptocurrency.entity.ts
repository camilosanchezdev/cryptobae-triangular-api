import { EvaluationEntity } from 'src/features/evaluations/entities/evaluation.entity';
import { WalletEntity } from 'src/features/wallets/entities/wallet.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PriceEntity } from './price.entity';

@Entity({
  name: 'cryptocurrencies',
})
export class CryptocurrencyEntity {
  // Basic properties
  @PrimaryGeneratedColumn({ name: 'cryptocurrency_id' })
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

  @Column({ type: String, nullable: false, unique: true })
  symbol: string;

  @OneToMany(() => PriceEntity, (price) => price.cryptocurrency)
  prices: PriceEntity[];

  @OneToMany(() => EvaluationEntity, (evaluation) => evaluation.cryptocurrency)
  evaluations: EvaluationEntity[];

  @OneToMany(() => WalletEntity, (wallet) => wallet.cryptocurrency)
  wallets: WalletEntity[];
}
