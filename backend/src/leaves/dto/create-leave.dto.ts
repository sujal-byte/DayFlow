import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { LeaveType } from '@prisma/client';

export class CreateLeaveDto {
  @ApiProperty({
    enum: LeaveType,
    description: 'Type of leave requested (PAID, SICK, UNPAID)',
    example: LeaveType.PAID,
  })
  @IsEnum(LeaveType, {
    message: 'type must be a valid LeaveType (PAID, SICK, UNPAID)',
  })
  @IsNotEmpty()
  type: LeaveType;

  @ApiProperty({
    description: 'Leave start date in ISO format (YYYY-MM-DD)',
    example: '2026-09-01',
  })
  @IsDateString({}, { message: 'startDate must be a valid ISO 8601 date string (YYYY-MM-DD)' })
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({
    description: 'Leave end date in ISO format (YYYY-MM-DD)',
    example: '2026-09-05',
  })
  @IsDateString({}, { message: 'endDate must be a valid ISO 8601 date string (YYYY-MM-DD)' })
  @IsNotEmpty()
  endDate: string;

  @ApiPropertyOptional({
    description: 'Reason for leave application',
    example: 'Attending annual family vacation',
  })
  @IsString()
  @IsOptional()
  reason?: string;
}
