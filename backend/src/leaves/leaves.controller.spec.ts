import { Test, TestingModule } from '@nestjs/testing';
import { LeavesController } from './leaves.controller';
import { LeavesService } from './leaves.service';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { LeaveStatus, LeaveType } from '@prisma/client';

describe('LeavesController', () => {
  let controller: LeavesController;

  const mockLeavesService = {
    requestLeave: jest.fn(),
    updateLeaveStatus: jest.fn(),
    findAll: jest.fn(),
    findByUser: jest.fn(),
    findOne: jest.fn(),
  };

  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeavesController],
      providers: [
        { provide: LeavesService, useValue: mockLeavesService },
        { provide: JwtService, useValue: mockJwtService },
        Reflector,
      ],
    }).compile();

    controller = module.get<LeavesController>(LeavesController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('requestLeave', () => {
    it('should call leavesService.requestLeave', async () => {
      const dto = {
        type: LeaveType.PAID,
        startDate: '2026-09-01',
        endDate: '2026-09-05',
        reason: 'Vacation',
      };
      const expectedResult = { id: 'leave-1', ...dto };
      mockLeavesService.requestLeave.mockResolvedValue(expectedResult);

      const result = await controller.requestLeave('user-1', dto);
      expect(mockLeavesService.requestLeave).toHaveBeenCalledWith('user-1', dto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('updateLeaveStatus', () => {
    it('should call leavesService.updateLeaveStatus', async () => {
      const dto = { status: LeaveStatus.APPROVED };
      const expectedResult = { id: 'leave-1', status: LeaveStatus.APPROVED };
      mockLeavesService.updateLeaveStatus.mockResolvedValue(expectedResult);

      const result = await controller.updateLeaveStatus('leave-1', 'admin-1', dto);
      expect(mockLeavesService.updateLeaveStatus).toHaveBeenCalledWith('leave-1', 'admin-1', LeaveStatus.APPROVED);
      expect(result).toEqual(expectedResult);
    });
  });
});
