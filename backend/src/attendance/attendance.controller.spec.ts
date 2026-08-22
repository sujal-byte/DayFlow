import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { JwtService } from '@nestjs/jwt';

describe('AttendanceController', () => {
  let controller: AttendanceController;

  const mockAttendanceService = {
    checkIn: jest.fn(),
    checkOut: jest.fn(),
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

  it('should call attendanceService.checkIn', async () => {
    mockAttendanceService.checkIn.mockResolvedValue({ id: 'att-1' });
    const result = await controller.checkIn('user-1');
    expect(mockAttendanceService.checkIn).toHaveBeenCalledWith('user-1');
    expect(result).toEqual({ id: 'att-1' });
  });

  it('should call attendanceService.checkOut', async () => {
    mockAttendanceService.checkOut.mockResolvedValue({ id: 'att-1' });
    const result = await controller.checkOut('user-1');
    expect(mockAttendanceService.checkOut).toHaveBeenCalledWith('user-1');
    expect(result).toEqual({ id: 'att-1' });
  });
});
