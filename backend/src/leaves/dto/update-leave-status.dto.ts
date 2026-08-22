import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { LeaveStatus } from '@prisma/client';

export class UpdateLeaveStatusDto {
  @ApiProperty({
    enum: LeaveStatus,
    description: 'New status for the leave request (APPROVED, REJECTED, PENDING)',
    example: LeaveStatus.APPROVED,
  })
  @IsEnum(LeaveStatus, {
    message: 'status must be a valid LeaveStatus (PENDING, APPROVED, REJECTED)',
  })
  @IsNotEmpty()
  status: LeaveStatus;
}
