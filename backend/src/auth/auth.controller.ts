import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register a new user',
    description: 'Registers a new employee/admin account and returns user details without the password.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User successfully registered.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input payload or validation error.',
  })
  @ApiConflictResponse({
    description: 'User with this email already exists.',
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login user',
    description: 'Authenticates user credentials and returns a JWT access token along with user profile details.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User authenticated successfully. Returns JWT access token and user info.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input payload or validation error.',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid email or password.',
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
