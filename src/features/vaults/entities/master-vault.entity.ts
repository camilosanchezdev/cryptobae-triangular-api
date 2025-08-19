import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { VaultMovementEntity } from './vault-movement.entity';

@Entity({
  name: 'master_vaults',
})
export class MasterVaultEntity {
  // Basic properties
  @PrimaryGeneratedColumn({ name: 'master_vault_id' })
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

  @Column({ name: 'name', type: 'varchar', nullable: false, unique: true })
  name: string;

  @Column({ name: 'amount', type: 'decimal', nullable: false })
  amount: number;

  @OneToMany(() => VaultMovementEntity, (movement) => movement.masterVault)
  movements: VaultMovementEntity[];
}
