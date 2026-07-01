import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.services';
import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiProperty,
} from '@nestjs/swagger';

class AuthDto {
  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'password123' })
  password: string;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {}

  @Post('signup')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: AuthDto })
  @ApiResponse({ status: 201, description: 'User created successfully.' })
  async signup(@Body() body: AuthDto) {
    const hashed = await this.authService.hash(body.password);

    return this.userService.create({
      email: body.email,
      password: hashed,
    });
  }

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiBody({ type: AuthDto })
  @ApiResponse({ status: 200, description: 'JWT token returned successfully.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  async login(@Body() body: AuthDto) {
    const user = await this.userService.findByEmail(body.email);

    if (!user) return { message: 'User not found' };

    const match = await this.authService.compare(body.password, user.password);

    if (!match) return { message: 'Invalid password' };

    const token = this.authService.generateToken(user);

    return { token };
  }
}
