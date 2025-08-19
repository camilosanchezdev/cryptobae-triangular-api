import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EvaluationEntity } from './evaluation.entity';

@Entity({
  name: 'recommended_actions',
})
export class RecommendedActionEntity {
  // Basic properties
  @PrimaryGeneratedColumn({ name: 'recommended_action_id' })
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

  @OneToMany(
    () => EvaluationEntity,
    (evaluation) => evaluation.recommendedAction,
  )
  evaluations: EvaluationEntity[];
}
