import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  InternalServerErrorException,
  Param,
  Patch,
  Delete,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { TrackerService } from './tracker.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { User } from 'src/user/user.entity';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiProperty,
} from '@nestjs/swagger';

class CreateTrackerDto {
  @ApiProperty({ example: 'My Daily Tracker' })
  title: string;

  @ApiProperty({ example: 45.5, required: false, default: 0 })
  cost?: number;

  @ApiProperty({
    example: '2026-07-01',
    required: false,
    description: 'Expense date (YYYY-MM-DD)',
  })
  date?: string;

  @ApiProperty({
    example: 'EXPENSE',
    required: false,
    enum: ['INCOME', 'EXPENSE'],
    default: 'EXPENSE',
    description: 'Type of transaction: INCOME or EXPENSE',
  })
  type?: 'INCOME' | 'EXPENSE';
}

class UpdateTrackerDto {
  @ApiProperty({ example: 'My Daily Tracker', required: false })
  title?: string;

  @ApiProperty({ example: 45.5, required: false })
  cost?: number;

  @ApiProperty({
    example: '2026-07-01',
    required: false,
    description: 'Expense date (YYYY-MM-DD)',
  })
  date?: string;

  @ApiProperty({
    example: 'EXPENSE',
    required: false,
    enum: ['INCOME', 'EXPENSE'],
    description: 'Type of transaction: INCOME or EXPENSE',
  })
  type?: 'INCOME' | 'EXPENSE';
}

interface userInterface {
  userId: number;
  email: string;
}

@ApiTags('Tracker')
@ApiBearerAuth()
@Controller('tracker')
export class TrackerController {
  constructor(private service: TrackerService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new tracker' })
  @ApiBody({ type: CreateTrackerDto })
  @ApiResponse({ status: 201, description: 'Tracker created successfully.' })
  create(
    @Body() body: CreateTrackerDto,
    @Request() req: { user: userInterface },
  ) {
    try {
      return this.service.create(
        body.title,
        body.cost ?? 0,
        body.date,
        body.type ?? 'EXPENSE',
        {
          id: req.user.userId,
          email: req.user.email,
        } as User,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create tracker';
      throw new InternalServerErrorException(message);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('today')
  @ApiOperation({ summary: "Get today's expenses and total cost" })
  @ApiResponse({
    status: 200,
    description: "Today's expenses retrieved successfully.",
  })
  getTodayStats(@Request() req: { user: userInterface }) {
    try {
      return this.service.getTodayStats(req.user.userId);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch today's stats";
      throw new InternalServerErrorException(message);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Get all trackers for the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'List of trackers retrieved successfully.',
  })
  findAll(@Request() req: { user: userInterface }) {
    try {
      return this.service.findAll(req.user.userId);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch trackers';
      throw new InternalServerErrorException(message);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a tracker by ID' })
  @ApiBody({ type: UpdateTrackerDto })
  @ApiResponse({ status: 200, description: 'Tracker updated successfully.' })
  @ApiResponse({ status: 404, description: 'Tracker not found.' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateTrackerDto,
    @Request() req: { user: userInterface },
  ) {
    try {
      const updated = await this.service.update(id, req.user.userId, body);
      if (!updated) {
        throw new NotFoundException('Tracker not found');
      }
      return updated;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      const message =
        error instanceof Error ? error.message : 'Failed to update tracker';
      throw new InternalServerErrorException(message);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a tracker by ID' })
  @ApiResponse({ status: 200, description: 'Tracker deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Tracker not found.' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: userInterface },
  ) {
    try {
      const deleted = await this.service.remove(id, req.user.userId);
      if (!deleted) {
        throw new NotFoundException('Tracker not found');
      }
      return { message: 'Tracker deleted successfully.' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      const message =
        error instanceof Error ? error.message : 'Failed to delete tracker';
      throw new InternalServerErrorException(message);
    }
  }
}
