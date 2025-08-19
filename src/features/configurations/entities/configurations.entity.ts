import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ConfigurationLogEntity } from './configurations-log.entity';

@Entity({
  name: 'configurations',
})
export class ConfigurationEntity {
  // Basic properties
  @PrimaryGeneratedColumn({ name: 'configuration_id' })
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

  @Column({ name: 'regex', type: String, nullable: false })
  regex: string;

  @OneToMany(
    () => ConfigurationLogEntity,
    (configurationLog) => configurationLog.configuration,
  )
  logs: ConfigurationLogEntity[];
}
