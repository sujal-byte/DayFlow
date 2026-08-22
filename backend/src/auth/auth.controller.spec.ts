import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Role } from '@prisma/client';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call authService.register and return the registered user', async () => {
      const registerDto = {
        email: 'employee@dayflow.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Doe',
      };

      const expectedResponse = {
        id: 'user-uuid',
        email: 'employee@dayflow.com',
        firstName: 'Jane',
        lastName: 'Doe',
        role: Role.EMPLOYEE,
        phone: null,
        address: null,
        profilePicUrl: null,
        salary: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAuthService.register.mockResolvedValue(expectedResponse);

      const result = await controller.register(registerDto);

      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('login', () => {
    it('should call authService.login and return token and user', async () => {
      const loginDto = {
        email: 'employee@dayflow.com',
        password: 'password123',
      };

      const expectedResponse = {
        access_token: 'signed-jwt-token',
        user: {
          id: 'user-uuid',
          email: 'employee@dayflow.com',
          firstName: 'Jane',
          lastName: 'Doe',
          role: Role.EMPLOYEE,
        },
      };

      mockAuthService.login.mockResolvedValue(expectedResponse);

      const result = await controller.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(expectedResponse);
    });
  });
});
