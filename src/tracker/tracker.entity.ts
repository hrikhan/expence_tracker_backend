import { User } from 'src/user/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Tracker {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  cost: number; // For tracking the cost/expend amount

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  date: string; // Tracks when the expense occurred (defaults to today)

  @Column({ type: 'varchar', default: 'EXPENSE' })
  type: 'INCOME' | 'EXPENSE';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;
}
