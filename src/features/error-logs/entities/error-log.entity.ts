import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({
  name: 'error_logs',
})
export class ErrorLogEntity {
  // Basic properties
  @PrimaryGeneratedColumn({ name: 'error_log_id' })
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
  @Column({ type: 'text', nullable: true })
  message: string;
  @Column({ type: 'text', nullable: true })
  details: string;
  @Column({ type: 'text', nullable: true })
  context: string;
}
