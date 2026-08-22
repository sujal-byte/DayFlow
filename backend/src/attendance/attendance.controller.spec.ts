import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { JwtService } from '@nestjs/jwt';

describe('AttendanceController', () => {
  let controller: AttendanceController;

  const mockAttendanceService = {
    checkIn: jest.fn(),
    checkOut: jest.fn(),
    generateQrToken: jest.fn(),
    processQrScan: jest.fn(),
  };

  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttendanceController],
      providers: [
        { provide: AttendanceService, useValue: mockAttendanceService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    controller = module.get<AttendanceController>(AttendanceController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should generate QR token', async () => {
    mockAttendanceService.generateQrToken.mockResolvedValue({
      token_hash: 'test-token',
      expires_at: new Date(),
    });

    const result = await controller.generateQrToken('user-1');
    expect(mockAttendanceService.generateQrToken).toHaveBeenCalledWith('user-1');
    expect(result).toHaveProperty('token_hash', 'test-token');
  });

  it('should process QR scan', async () => {
    mockAttendanceService.processQrScan.mockResolvedValue({ id: 'att-1' });

    const result = await controller.processQrScan('user-1', {
      tokenHash: 'test-token',
      action: 'check-in',
    });

    expect(mockAttendanceService.processQrScan).toHaveBeenCalledWith(
      'user-1',
      'test-token',
      'check-in',
    );
    expect(result).toEqual({ id: 'att-1' });
  });

  it('should call attendanceService.checkIn directly', async () => {
    mockAttendanceService.checkIn.mockResolvedValue({ id: 'att-1' });
    const result = await controller.checkIn('user-1');
    expect(mockAttendanceService.checkIn).toHaveBeenCalledWith('user-1');
    expect(result).toEqual({ id: 'att-1' });
  });

  it('should call attendanceService.checkOut directly', async () => {
    mockAttendanceService.checkOut.mockResolvedValue({ id: 'att-1' });
    const result = await controller.checkOut('user-1');
    expect(mockAttendanceService.checkOut).toHaveBeenCalledWith('user-1');
    expect(result).toEqual({ id: 'att-1' });
  });
});
