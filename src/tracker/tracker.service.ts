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

  async findAll(userId: number) {
    const items = await this.repo.find({
      where: { user: { id: userId } },
      order: { date: 'DESC', createdAt: 'DESC' },
    });

    const expenseSum = await this.repo
      .createQueryBuilder('tracker')
      .select('SUM(tracker.cost)', 'sum')
      .innerJoin('tracker.user', 'user')
      .where('user.id = :userId', { userId })
      .andWhere("tracker.type = 'EXPENSE'")
      .getRawOne<{ sum: string | null }>();

    const incomeSum = await this.repo
      .createQueryBuilder('tracker')
      .select('SUM(tracker.cost)', 'sum')
      .innerJoin('tracker.user', 'user')
      .where('user.id = :userId', { userId })
      .andWhere("tracker.type = 'INCOME'")
      .getRawOne<{ sum: string | null }>();

    const totalExpense = parseFloat(expenseSum?.sum ?? '0') || 0;
    const totalIncome = parseFloat(incomeSum?.sum ?? '0') || 0;
    const balance = totalIncome - totalExpense;

    return {
      items,
      totalExpense,
      totalIncome,
      balance,
    };
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

  async findOne(id: number, userId: number) {
    return this.repo.findOne({
      where: { id, user: { id: userId } },
    });
  }

  async update(id: number, userId: number, data: Partial<Tracker>) {
    const tracker = await this.findOne(id, userId);
    if (!tracker) {
      return null;
    }
    await this.repo.update(id, data);
    return this.findOne(id, userId);
  }

  async remove(id: number, userId: number) {
    const tracker = await this.findOne(id, userId);
    if (!tracker) {
      return false;
    }
    await this.repo.delete(id);
    return true;
  }
}
