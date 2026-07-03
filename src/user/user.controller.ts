import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  UseGuards,
  NotFoundException,
  Request,
  InternalServerErrorException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiProperty,
} from '@nestjs/swagger';
import * as bcrypt from 'bcrypt';

class UpdateUserDto {
  @ApiProperty({ required: false, example: 'user@example.com' })
  email?: string;

  @ApiProperty({ required: false, example: 'newpassword123' })
  password?: string;

  @ApiProperty({ required: false, example: 'John Doe' })
  fullName?: string;

  @ApiProperty({ required: false, example: 25 })
  age?: number;
}

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile from token' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully.',
  })
  async getProfile(
    @Request() req: { user: { userId: number; email: string } },
  ) {
    try {
      const userId = req.user.userId;
      const user = await this.userService.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const result: Partial<User> = { ...user };
      delete result.password;
      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      const message =
        error instanceof Error ? error.message : 'Error fetching profile';
      throw new InternalServerErrorException(message);
    }
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'User updated successfully.' })
  async update(
    @Request() req: { user: { userId: number; email: string } },
    @Body() data: UpdateUserDto,
  ) {
    try {
      const userId = req.user.userId;
      const user = await this.userService.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const updateData: Partial<User> = {};
      if (data.email !== undefined) updateData.email = data.email;
      if (data.fullName !== undefined) updateData.fullName = data.fullName;
      if (data.age !== undefined) updateData.age = data.age;
      if (data.password !== undefined) {
        updateData.password = await bcrypt.hash(data.password, 10);
      }

      if (Object.keys(updateData).length > 0) {
        await this.userService.update(userId, updateData);
      }

      const updatedUser = await this.userService.findById(userId);
      if (!updatedUser) {
        throw new NotFoundException('User not found');
      }

      const result: Partial<User> = { ...updatedUser };
      delete result.password;
      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      const message =
        error instanceof Error ? error.message : 'Error updating profile';
      throw new InternalServerErrorException(message);
    }
  }

  @Delete('profile')
  @ApiOperation({ summary: 'Delete current user account' })
  @ApiResponse({ status: 200, description: 'User deleted successfully.' })
  async remove(@Request() req: { user: { userId: number; email: string } }) {
    try {
      const userId = req.user.userId;
      const user = await this.userService.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      await this.userService.remove(userId);
      return { message: 'User deleted successfully.' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      const message =
        error instanceof Error ? error.message : 'Error deleting account';
      throw new InternalServerErrorException(message);
    }
  }
}
