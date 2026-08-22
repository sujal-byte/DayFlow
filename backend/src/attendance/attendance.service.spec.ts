import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceService } from './attendance.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

describe('AttendanceService', () => {
  let service: AttendanceService;

  const mockPrismaService = {
    attendance: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    qr_tokens: {
      create: jest.fn(),
      findUnique: jest.fn(),
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

  describe('generateQrToken', () => {
    it('should generate a 32-byte hex token and save to database', async () => {
      const mockCreatedToken = {
        token_hash: 'mockhex1234567890',
        user_id: 'user-1',
        expires_at: new Date(Date.now() + 30 * 1000),
        is_consumed: false,
      };

      mockPrismaService.qr_tokens.create.mockResolvedValue(mockCreatedToken);

      const result = await service.generateQrToken('user-1');

      expect(mockPrismaService.qr_tokens.create).toHaveBeenCalledWith({
        data: {
          token_hash: expect.any(String),
          user_id: 'user-1',
          expires_at: expect.any(Date),
          is_consumed: false,
        },
      });
      expect(result.token_hash).toBe(mockCreatedToken.token_hash);
    });
  });

  describe('processQrScan', () => {
    const validToken = {
      token_hash: 'valid-token',
      user_id: 'user-1',
      expires_at: new Date(Date.now() + 5 * 60 * 1000),
      is_consumed: false,
    };

    it('should throw NotFoundException if token does not exist', async () => {
      mockPrismaService.qr_tokens.findUnique.mockResolvedValue(null);

      await expect(
        service.processQrScan('user-1', 'invalid-token', 'check-in'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException if token is already consumed', async () => {
      mockPrismaService.qr_tokens.findUnique.mockResolvedValue({
        ...validToken,
        is_consumed: true,
      });

      await expect(
        service.processQrScan('user-1', 'valid-token', 'check-in'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if token is expired', async () => {
      mockPrismaService.qr_tokens.findUnique.mockResolvedValue({
        ...validToken,
        expires_at: new Date(Date.now() - 60 * 1000),
      });

      await expect(
        service.processQrScan('user-1', 'valid-token', 'check-in'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user ID does not match token owner', async () => {
      mockPrismaService.qr_tokens.findUnique.mockResolvedValue(validToken);

      await expect(
        service.processQrScan('other-user', 'valid-token', 'check-in'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should mark token consumed and check in user', async () => {
      mockPrismaService.qr_tokens.findUnique.mockResolvedValue(validToken);
      mockPrismaService.qr_tokens.update.mockResolvedValue({
        ...validToken,
        is_consumed: true,
      });
      mockPrismaService.attendance.findFirst.mockResolvedValue(null);
      mockPrismaService.attendance.create.mockResolvedValue({
        id: 'att-1',
        userId: 'user-1',
        status: 'PRESENT',
      });

      const result = await service.processQrScan('user-1', 'valid-token', 'check-in');

      expect(mockPrismaService.qr_tokens.update).toHaveBeenCalledWith({
        where: { token_hash: 'valid-token' },
        data: { is_consumed: true },
      });
      expect(result).toHaveProperty('id', 'att-1');
    });
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
