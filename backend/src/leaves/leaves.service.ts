import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LeaveStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateLeaveDto } from './dto/create-leave.dto';

@Injectable()
export class LeavesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Create a new leave request with PENDING status
   */
  async requestLeave(userId: string, data: CreateLeaveDto) {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid date format provided for start or end date');
    }

    if (startDate > endDate) {
      throw new BadRequestException('startDate cannot be after endDate');
    }

    return this.prisma.leaveRequest.create({
      data: {
        userId,
        type: data.type,
        startDate,
        endDate,
        reason: data.reason?.trim(),
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
  }

  /**
   * Update leave request status and set approverId, then trigger audit logging
   */
  async updateLeaveStatus(leaveId: string, adminId: string, status: LeaveStatus | string) {
    // Check if the leave request exists
    const existingLeave = await this.prisma.leaveRequest.findUnique({
      where: { id: leaveId },
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

    if (!existingLeave) {
      throw new NotFoundException(`Leave request with ID '${leaveId}' not found`);
    }

    // Update the leave request with the new status and approver
    const updatedLeave = await this.prisma.leaveRequest.update({
      where: { id: leaveId },
      data: {
        status: status as LeaveStatus,
        approverId: adminId,
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

    // Record the status change in the AuditLog table
    await this.auditService.logAction(
      adminId,
      'UPDATE_LEAVE_STATUS',
      'LeaveRequest',
      leaveId,
    );

    return updatedLeave;
  }

  /**
   * Get all leave requests
   */
  async findAll() {
    return this.prisma.leaveRequest.findMany({
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
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get all leave requests for a specific user
   */
  async findByUser(userId: string) {
    return this.prisma.leaveRequest.findMany({
      where: { userId },
      include: {
        approver: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get a single leave request by ID
   */
  async findOne(id: string) {
    const leave = await this.prisma.leaveRequest.findUnique({
      where: { id },
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

    if (!leave) {
      throw new NotFoundException(`Leave request with ID '${id}' not found`);
    }

    return leave;
  }
}
