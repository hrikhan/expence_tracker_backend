import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private repo: Repository<User>,
  ) {}

  create(data: Partial<User>) {
    return this.repo.save(this.repo.create(data));
  }
  findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }
  findById(id: number) {
    return this.repo.findOne({ where: { id } });
  }
  update(id: number, data: Partial<User>) {
    return this.repo.update(id, data);
  }
  remove(id: number) {
    return this.repo.delete(id);
  }
}
