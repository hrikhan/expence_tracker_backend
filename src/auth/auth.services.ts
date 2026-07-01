import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../user/user.entity';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  // hash password before save

  hash(password: string) {
    return bcrypt.hash(password, 10);
  }
  // compare login password
  async compare(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
  }
  // create JWT token
  generateToken(user: User) {
    return this.jwtService.sign({
      userId: user.id,
      email: user.email,
    });
  }
}
