import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.services';
import {
  Body,
  Controller,
  Post,
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiProperty,
} from '@nestjs/swagger';

class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'password123' })
  password: string;
}

class SignupDto {
  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'password123' })
  password: string;

  @ApiProperty({ required: false, example: 'John Doe' })
  fullName?: string;

  @ApiProperty({ required: false, example: 25 })
  age?: number;
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
  @ApiBody({ type: SignupDto })
  @ApiResponse({ status: 201, description: 'User created successfully.' })
  async signup(@Body() body: SignupDto) {
    try {
      const existingUser = await this.userService.findByEmail(body.email);
      if (existingUser) {
        throw new ConflictException('Email already in use');
      }

      const hashed = await this.authService.hash(body.password);

      return await this.userService.create({
        email: body.email,
        password: hashed,
        fullName: body.fullName,
        age: body.age,
      });
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      const message =
        error instanceof Error ? error.message : 'Error occurred during signup';
      throw new InternalServerErrorException(message);
    }
  }

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'JWT token returned successfully.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  async login(@Body() body: LoginDto) {
    try {
      const user = await this.userService.findByEmail(body.email);

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const match = await this.authService.compare(
        body.password,
        user.password,
      );

      if (!match) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const token = this.authService.generateToken(user);

      return { token };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      const message =
        error instanceof Error ? error.message : 'Error occurred during login';
      throw new InternalServerErrorException(message);
    }
  }
}
