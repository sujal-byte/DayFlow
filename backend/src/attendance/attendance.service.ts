import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates a secure, single-use 30-second QR code token
   */
  async generateQrToken(userId: string) {
    // Generate 32-byte secure random hex string
    const tokenHash = crypto.randomBytes(32).toString('hex');

    // Calculate expiration timestamp 30 seconds from right now
    const expiresAt = new Date(Date.now() + 30 * 1000);

    // Save token record to the database
    const tokenRecord = await (this.prisma as any).qr_tokens.create({
      data: {
        token_hash: tokenHash,
        user_id: userId,
        expires_at: expiresAt,
        is_consumed: false,
      },
    });

    return {
      token_hash: tokenRecord.token_hash,
      expires_at: tokenRecord.expires_at,
    };
  }

  /**
   * Validates a scanned QR token and executes check-in / check-out
   */
  async processQrScan(
    userId: string,
    tokenHash: string,
    action: 'check-in' | 'check-out',
  ) {
    // 1. Query token record by token_hash
    const tokenRecord = await (this.prisma as any).qr_tokens.findUnique({
      where: { token_hash: tokenHash },
    });

    if (!tokenRecord) {
      throw new NotFoundException('Invalid or unknown QR code.');
    }

    // 2. Check if already consumed
    if (tokenRecord.is_consumed) {
      throw new UnauthorizedException('This QR code has already been used.');
    }

    // 3. Check if expired
    if (new Date() > new Date(tokenRecord.expires_at)) {
      throw new UnauthorizedException('QR code has expired. Please generate a new one.');
    }

    // 4. Verify user ownership
    if (tokenRecord.user_id !== userId) {
      throw new UnauthorizedException('This QR code does not belong to your account.');
    }

    // 5. Mark token as consumed
    await (this.prisma as any).qr_tokens.update({
      where: { token_hash: tokenHash },
      data: { is_consumed: true },
    });

    // 6. Execute requested attendance action
    if (action === 'check-in') {
      return this.checkIn(userId);
    } else if (action === 'check-out') {
      return this.checkOut(userId);
    } else {
      throw new BadRequestException("Action must be either 'check-in' or 'check-out'");
    }
  }

  async checkIn(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to midnight for accurate date checking

    // Check if a record already exists for today
    const existing = await this.prisma.attendance.findFirst({
      where: { userId: userId, date: today },
    });

    if (existing) {
      throw new ConflictException('You have already checked in today.');
    }

    // Create the new check-in record
    return this.prisma.attendance.create({
      data: {
        userId: userId,
        date: today,
        checkIn: new Date(),
        status: 'PRESENT',
      },
    });
  }

  async checkOut(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find today's active check-in
    const existing = await this.prisma.attendance.findFirst({
      where: { userId: userId, date: today },
    });

    if (!existing) {
      throw new NotFoundException('Cannot check out: No check-in found for today.');
    }

    // Update the record with the check-out time
    return this.prisma.attendance.update({
      where: { id: existing.id },
      data: { checkOut: new Date() },
    });
  }
}