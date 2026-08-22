import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceService } from './attendance.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('AttendanceService', () => {
  let service: AttendanceService;

  const mockPrismaService = {
    attendance: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AttendanceService>(AttendanceService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkIn', () => {
    it('should create attendance record on check-in', async () => {
      mockPrismaService.attendance.findFirst.mockResolvedValue(null);
      mockPrismaService.attendance.create.mockResolvedValue({
        id: 'att-1',
        userId: 'user-1',
        status: 'PRESENT',
      });

      const result = await service.checkIn('user-1');
      expect(mockPrismaService.attendance.findFirst).toHaveBeenCalled();
      expect(mockPrismaService.attendance.create).toHaveBeenCalled();
      expect(result).toHaveProperty('id', 'att-1');
    });

    it('should throw ConflictException if already checked in today', async () => {
      mockPrismaService.attendance.findFirst.mockResolvedValue({ id: 'att-1' });

      await expect(service.checkIn('user-1')).rejects.toThrow(ConflictException);
    });
  });

  describe('checkOut', () => {
    it('should update checkOut time for today check-in', async () => {
      mockPrismaService.attendance.findFirst.mockResolvedValue({ id: 'att-1' });
      mockPrismaService.attendance.update.mockResolvedValue({
        id: 'att-1',
        checkOut: new Date(),
      });

      const result = await service.checkOut('user-1');
      expect(mockPrismaService.attendance.update).toHaveBeenCalled();
      expect(result).toHaveProperty('id', 'att-1');
    });

    it('should throw NotFoundException if no check-in exists for today', async () => {
      mockPrismaService.attendance.findFirst.mockResolvedValue(null);

      await expect(service.checkOut('user-1')).rejects.toThrow(NotFoundException);
    });
  });
});
