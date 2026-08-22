import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class ScanQrDto {
  @ApiProperty({
    description: 'The 32-byte hex token string encoded in the QR code',
    example: 'd41d8cd98f00b204e9800998ecf8427e69677bb79e0a29486c9f6976a4a6fa18',
  })
  @IsString()
  @IsNotEmpty()
  tokenHash: string;

  @ApiProperty({
    description: 'Attendance action to execute upon scanning',
    enum: ['check-in', 'check-out'],
    example: 'check-in',
  })
  @IsIn(['check-in', 'check-out'], {
    message: 'action must be either "check-in" or "check-out"',
  })
  @IsNotEmpty()
  action: 'check-in' | 'check-out';
}
