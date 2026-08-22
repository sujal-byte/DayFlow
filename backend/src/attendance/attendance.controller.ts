import { Controller, Post, Patch, UseGuards, HttpStatus } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('Attendance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('check-in')
  @ApiOperation({ summary: 'Log daily check-in time' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Successfully recorded daily check-in.',
  })
  @ApiConflictResponse({
    description: 'You have already checked in today.',
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authenticated.',
  })
  checkIn(@CurrentUser('id') userId: string) {
    return this.attendanceService.checkIn(userId);
  }

  @Patch('check-out')
  @ApiOperation({ summary: 'Log daily check-out time' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully recorded daily check-out.',
  })
  @ApiNotFoundResponse({
    description: 'Cannot check out: No check-in found for today.',
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authenticated.',
  })
  checkOut(@CurrentUser('id') userId: string) {
    return this.attendanceService.checkOut(userId);
  }
}