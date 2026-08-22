import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { LeavesService } from './leaves.service';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { UpdateLeaveStatusDto } from './dto/update-leave-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Leaves')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('leaves')
export class LeavesController {
  constructor(private readonly leavesService: LeavesService) {}

  @Post()
  @ApiOperation({
    summary: 'Submit a new leave request',
    description: 'Creates a new leave request in PENDING status for the currently authenticated employee.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Leave request submitted successfully with PENDING status.',
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authenticated or token is invalid.',
  })
  async requestLeave(
    @CurrentUser('id') userId: string,
    @Body() createLeaveDto: CreateLeaveDto,
  ) {
    return this.leavesService.requestLeave(userId, createLeaveDto);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update leave request status (Admin only)',
    description: 'Approves or rejects a leave request, sets the approverId to the current admin, and records an audit log.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the leave request',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    type: UpdateLeaveStatusDto,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Leave request status successfully updated and audited.',
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authenticated.',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden resource: Requires ADMIN role.',
  })
  @ApiNotFoundResponse({
    description: 'Leave request with the specified ID was not found.',
  })
  async updateLeaveStatus(
    @Param('id') leaveId: string,
    @CurrentUser('id') adminId: string,
    @Body() updateStatusDto: UpdateLeaveStatusDto,
  ) {
    return this.leavesService.updateLeaveStatus(
      leaveId,
      adminId,
      updateStatusDto.status,
    );
  }

  @Get('my-leaves')
  @ApiOperation({
    summary: 'Get logged-in user leave history',
    description: 'Retrieves all leave requests submitted by the current authenticated user.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of leave requests submitted by the current user.',
  })
  async getMyLeaves(@CurrentUser('id') userId: string) {
    return this.leavesService.findByUser(userId);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Get all leave requests (Admin only)',
    description: 'Retrieves all leave requests across the company.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of all leave requests.',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden resource: Requires ADMIN role.',
  })
  async findAll() {
    return this.leavesService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get leave request details by ID',
    description: 'Retrieves a single leave request by its UUID.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the leave request',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Leave request details found.',
  })
  @ApiNotFoundResponse({
    description: 'Leave request not found.',
  })
  async findOne(@Param('id') id: string) {
    return this.leavesService.findOne(id);
  }
}
