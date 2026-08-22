import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Record an action in the database AuditLog table
   */
  async logAction(
    userId: string,
    action: string,
    entity: string,
    entityId: string,
    details?: any,
  ) {
    try {
      return await this.prisma.auditLog.create({
        data: {
          userId,
          action,
          entity,
          entityId,
          details: details !== undefined ? details : undefined,
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to record audit log: [${action}] on ${entity}:${entityId} by user ${userId}`,
        error,
      );
      throw error;
    }
  }
}
