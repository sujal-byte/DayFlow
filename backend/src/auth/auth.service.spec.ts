import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto = {
      email: 'test@dayflow.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
    };

    it('should throw ConflictException if user already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: '1', email: 'test@dayflow.com' });

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@dayflow.com' },
      });
    });

    it('should hash password and create new user, returning user without password', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockImplementation((args) =>
        Promise.resolve({
          id: 'user-123',
          email: args.data.email,
          password: args.data.password,
          firstName: args.data.firstName,
          lastName: args.data.lastName,
          role: Role.EMPLOYEE,
        }),
      );

      const result = await service.register(registerDto);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@dayflow.com' },
      });
      expect(mockPrismaService.user.create).toHaveBeenCalled();
      expect(result).not.toHaveProperty('password');
      expect(result.id).toEqual('user-123');
      expect(result.email).toEqual('test@dayflow.com');
      expect(result.firstName).toEqual('John');
      expect(result.lastName).toEqual('Doe');
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@dayflow.com',
      password: 'password123',
    };

    it('should throw UnauthorizedException if user is not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password comparison fails', async () => {
      const hashedPassword = await bcrypt.hash('different_password', 10);
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-123',
        email: 'test@dayflow.com',
        password: hashedPassword,
        role: Role.EMPLOYEE,
      });

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should return access token and user info when credentials are valid', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const user = {
        id: 'user-123',
        email: 'test@dayflow.com',
        password: hashedPassword,
        role: Role.EMPLOYEE,
        firstName: 'John',
        lastName: 'Doe',
      };
      mockPrismaService.user.findUnique.mockResolvedValue(user);
      mockJwtService.signAsync.mockResolvedValue('mock-jwt-token');

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('access_token', 'mock-jwt-token');
      expect(result).toHaveProperty('user');
      expect(result.user).not.toHaveProperty('password');
      expect(result.user.email).toBe('test@dayflow.com');
      expect(mockJwtService.signAsync).toHaveBeenCalledWith({
        sub: 'user-123',
        id: 'user-123',
        email: 'test@dayflow.com',
        role: Role.EMPLOYEE,
      });
    });
  });
});
