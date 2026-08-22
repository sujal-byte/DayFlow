import { Module } from '@nestjs/common';
import { LeavesService } from './leaves.service';
import { LeavesController } from './leaves.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditService } from '../audit/audit.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [LeavesController],
  providers: [LeavesService, AuditService],
  exports: [LeavesService],
})
export class LeavesModule {}
