import { Test, TestingModule } from '@nestjs/testing';
import { AuditService } from './audit.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuditService', () => {
  let service: AuditService;

  const mockPrismaService = {
    auditLog: {
      create: jest.fn().mockResolvedValue({
        id: 'audit-uuid-1',
        action: 'UPDATE_LEAVE_STATUS',
        entity: 'LeaveRequest',
        entityId: 'leave-uuid-1',
        userId: 'admin-uuid-1',
        createdAt: new Date(),
      }),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should log an action to the audit log', async () => {
    const result = await service.logAction(
      'admin-uuid-1',
      'UPDATE_LEAVE_STATUS',
      'LeaveRequest',
      'leave-uuid-1',
    );

    expect(mockPrismaService.auditLog.create).toHaveBeenCalledWith({
      data: {
        userId: 'admin-uuid-1',
        action: 'UPDATE_LEAVE_STATUS',
        entity: 'LeaveRequest',
        entityId: 'leave-uuid-1',
        details: undefined,
      },
    });
    expect(result).toHaveProperty('id', 'audit-uuid-1');
  });
});
