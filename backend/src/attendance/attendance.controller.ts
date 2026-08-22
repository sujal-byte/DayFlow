import {
  Controller,
  Post,
  Patch,
  Get,
  Body,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ScanQrDto } from './dto/scan-qr.dto';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';

@ApiTags('Attendance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get('qr')
  @ApiOperation({
    summary: 'Generate rotating 30-second QR code token',
    description: 'Generates a 32-byte secure random token valid for 30 seconds for employee check-in / check-out.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'QR token successfully generated with expiration timestamp.',
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authenticated.',
  })
  async generateQrToken(@CurrentUser('id') userId: string) {
    return this.attendanceService.generateQrToken(userId);
  }

  @Post('scan')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Process scanned QR code for attendance',
    description: 'Validates scanned QR token and executes check-in or check-out.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Attendance recorded successfully via QR code.',
  })
  @ApiNotFoundResponse({
    description: 'QR token not found or invalid.',
  })
  @ApiUnauthorizedResponse({
    description: 'QR token expired, already consumed, or unauthorized.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid payload or action format.',
  })
  @ApiConflictResponse({
    description: 'User has already checked in today.',
  })
  async processQrScan(
    @CurrentUser('id') userId: string,
    @Body() scanQrDto: ScanQrDto,
  ) {
    return this.attendanceService.processQrScan(
      userId,
      scanQrDto.tokenHash,
      scanQrDto.action,
    );
  }

  @Post('check-in')
  @ApiOperation({ summary: 'Log daily check-in time directly' })
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
  async checkIn(@CurrentUser('id') userId: string) {
    return this.attendanceService.checkIn(userId);
  }

  @Patch('check-out')
  @ApiOperation({ summary: 'Log daily check-out time directly' })
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
  async checkOut(@CurrentUser('id') userId: string) {
    return this.attendanceService.checkOut(userId);
  }
}