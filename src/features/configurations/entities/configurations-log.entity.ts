import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ConfigurationEntity } from './configurations.entity';

@Entity({
  name: 'configuration_logs',
})
export class ConfigurationLogEntity {
  // Basic properties
  @PrimaryGeneratedColumn({ name: 'configuration_log_id' })
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

  @Column({ name: 'key', type: String, nullable: false })
  key: string;

  @Column({ name: 'value', type: String, nullable: false })
  value: string;

  @Column({ name: 'old_value', type: String, nullable: false })
  oldValue: string;

  @Column({ name: 'configuration_id', type: 'int', nullable: false })
  configurationId: number;
  // Relations
  @ManyToOne(() => ConfigurationEntity, (configuration) => configuration.logs)
  @JoinColumn({ name: 'configuration_id' })
  configuration: ConfigurationEntity;
}
