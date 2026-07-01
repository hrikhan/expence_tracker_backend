import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tracker } from './tracker.entity';
import { Repository } from 'typeorm';
import { User } from 'src/user/user.entity';

@Injectable()
export class TrackerService {
  constructor(
    @InjectRepository(Tracker)
    private repo: Repository<Tracker>,
  ) {}

  create(
    title: string,
    cost: number,
    date: string | undefined,
    type: 'INCOME' | 'EXPENSE',
    user: User,
  ) {
    return this.repo.save(
      this.repo.create({
        title,
        cost,
        date: date || undefined,
        type,
        user,
      }),
    );
  }

  findAll(userId: number) {
    return this.repo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async getTodayStats(userId: number) {
    const todayItems = await this.repo
      .createQueryBuilder('tracker')
      .innerJoin('tracker.user', 'user')
      .where('user.id = :userId', { userId })
      .andWhere('tracker.date = CURRENT_DATE')
      .orderBy('tracker.createdAt', 'DESC')
      .getMany();

    const expenseSum = await this.repo
      .createQueryBuilder('tracker')
      .select('SUM(tracker.cost)', 'sum')
      .innerJoin('tracker.user', 'user')
      .where('user.id = :userId', { userId })
      .andWhere('tracker.date = CURRENT_DATE')
      .andWhere("tracker.type = 'EXPENSE'")
      .getRawOne<{ sum: string | null }>();

    const incomeSum = await this.repo
      .createQueryBuilder('tracker')
      .select('SUM(tracker.cost)', 'sum')
      .innerJoin('tracker.user', 'user')
      .where('user.id = :userId', { userId })
      .andWhere('tracker.date = CURRENT_DATE')
      .andWhere("tracker.type = 'INCOME'")
      .getRawOne<{ sum: string | null }>();

    const totalExpense = parseFloat(expenseSum?.sum ?? '0') || 0;
    const totalIncome = parseFloat(incomeSum?.sum ?? '0') || 0;
    const balance = totalIncome - totalExpense;

    return {
      items: todayItems,
      totalExpense,
      totalIncome,
      balance,
    };
  }
}
