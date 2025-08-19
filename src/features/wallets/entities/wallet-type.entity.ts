import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { WalletEntity } from './wallet.entity';

@Entity({
  name: 'wallet_types',
})
export class WalletTypeEntity {
  // Basic properties
  @PrimaryGeneratedColumn({ name: 'wallet_type_id' })
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

  @Column({ name: 'name', type: String, nullable: false })
  name: string;

  @OneToMany(() => WalletEntity, (wallet) => wallet.walletType)
  wallets: WalletEntity[];
}
