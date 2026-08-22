import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) { }

  async checkIn(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to midnight for accurate date checking

    // Check if a record already exists for today
    const existing = await this.prisma.attendance.findFirst({
      where: { userId: userId, date: today }
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
      where: { userId: userId, date: today }
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