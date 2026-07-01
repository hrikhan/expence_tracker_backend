import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
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
  }

  @UseGuards(JwtAuthGuard)
  @Get('today')
  @ApiOperation({ summary: "Get today's expenses and total cost" })
  @ApiResponse({
    status: 200,
    description: "Today's expenses retrieved successfully.",
  })
  getTodayStats(@Request() req: { user: userInterface }) {
    return this.service.getTodayStats(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Get all trackers for the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'List of trackers retrieved successfully.',
  })
  findAll(@Request() req: { user: userInterface }) {
    return this.service.findAll(req.user.userId);
  }
}
