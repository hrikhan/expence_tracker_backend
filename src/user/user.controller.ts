import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  UseGuards,
  NotFoundException,
  Request,
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
    // req.user is automatically populated by JwtAuthGuard from the decoded token
    const userId = req.user.userId;
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const result: Partial<User> = { ...user };
    delete result.password;
    return result;
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'User updated successfully.' })
  async update(
    @Request() req: { user: { userId: number; email: string } },
    @Body() data: UpdateUserDto,
  ) {
    const userId = req.user.userId;
    const updateData = { ...data };

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    return this.userService.update(userId, updateData);
  }

  @Delete('profile')
  @ApiOperation({ summary: 'Delete current user account' })
  @ApiResponse({ status: 200, description: 'User deleted successfully.' })
  async remove(@Request() req: { user: { userId: number; email: string } }) {
    const userId = req.user.userId;
    return this.userService.remove(userId);
  }
}
