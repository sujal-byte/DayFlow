import { Test, TestingModule } from '@nestjs/testing';
import { LeavesService } from './leaves.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { LeaveStatus, LeaveType } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';

describe('LeavesService', () => {
  let service: LeavesService;

  const mockPrismaService = {
    leaveRequest: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
  };

  const mockAuditService = {
    logAction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeavesService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: AuditService, useValue: mockAuditService },
      ],
    }).compile();

    service = module.get<LeavesService>(LeavesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('requestLeave', () => {
    it('should create a leave request with PENDING status', async () => {
      const dto = {
        type: LeaveType.PAID,
        startDate: '2026-09-01',
        endDate: '2026-09-05',
        reason: 'Vacation',
      };

      const createdLeave = {
        id: 'leave-1',
        userId: 'user-1',
        ...dto,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        status: LeaveStatus.PENDING,
      };

      mockPrismaService.leaveRequest.create.mockResolvedValue(createdLeave);

      const result = await service.requestLeave('user-1', dto);

      expect(mockPrismaService.leaveRequest.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          type: dto.type,
          startDate: expect.any(Date),
          endDate: expect.any(Date),
          reason: dto.reason,
          status: LeaveStatus.PENDING,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });
      expect(result).toEqual(createdLeave);
    });
  });

  describe('updateLeaveStatus', () => {
    it('should update status and trigger audit log', async () => {
      const existingLeave = {
        id: 'leave-1',
        userId: 'user-1',
        status: LeaveStatus.PENDING,
      };

      const updatedLeave = {
        ...existingLeave,
        status: LeaveStatus.APPROVED,
        approverId: 'admin-1',
      };

      mockPrismaService.leaveRequest.findUnique.mockResolvedValue(existingLeave);
      mockPrismaService.leaveRequest.update.mockResolvedValue(updatedLeave);
      mockAuditService.logAction.mockResolvedValue({ id: 'audit-1' });

      const result = await service.updateLeaveStatus('leave-1', 'admin-1', LeaveStatus.APPROVED);

      expect(mockPrismaService.leaveRequest.update).toHaveBeenCalledWith({
        where: { id: 'leave-1' },
        data: {
          status: LeaveStatus.APPROVED,
          approverId: 'admin-1',
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          approver: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      expect(mockAuditService.logAction).toHaveBeenCalledWith(
        'admin-1',
        'UPDATE_LEAVE_STATUS',
        'LeaveRequest',
        'leave-1',
      );

      expect(result).toEqual(updatedLeave);
    });

    it('should throw NotFoundException if leave request does not exist', async () => {
      mockPrismaService.leaveRequest.findUnique.mockResolvedValue(null);

      await expect(
        service.updateLeaveStatus('non-existent', 'admin-1', LeaveStatus.APPROVED),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
