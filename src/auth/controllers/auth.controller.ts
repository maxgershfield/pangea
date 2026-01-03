import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  HttpException,
  Request,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service.js';
import { RegisterDto, LoginDto, AuthResponseDto } from '../dto/index.js';
import { Public } from '../decorators/public.decorator.js';
import { UseGuards } from '@nestjs/common';
import { JwksJwtGuard } from '../guards/jwks-jwt.guard.js';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Register new user
   * POST /api/auth/register
   */
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  /**
   * Login user
   * POST /api/auth/login
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }


  /**
   * Request password reset
   * POST /api/auth/forgot-password
   */
  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() body: { email: string }): Promise<{ message: string }> {
    await this.authService.forgotPassword(body.email);
    return { message: 'If the email exists, a password reset link has been sent' };
  }

  /**
   * Reset password
   * POST /api/auth/reset-password
   */
  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() body: { token: string; newPassword: string },
  ): Promise<{ message: string }> {
    await this.authService.resetPassword(body.token, body.newPassword);
    return { message: 'Password reset successfully' };
  }

  /**
   * Create OASIS avatar for Better-Auth user
   * POST /api/auth/create-oasis-avatar
   * 
   * This endpoint is called by the frontend after Better-Auth registration/login.
   * It creates an OASIS avatar and links it to the authenticated user.
   * 
   * Protected by JwksJwtGuard - requires valid Better-Auth token.
   * 
   * Body (optional - will use token claims if not provided):
   * {
   *   email?: string,
   *   username?: string,
   *   firstName?: string,
   *   lastName?: string,
   *   name?: string (will be split into firstName/lastName)
   * }
   */
  @UseGuards(JwksJwtGuard)
  @Post('create-oasis-avatar')
  @HttpCode(HttpStatus.CREATED)
  async createOasisAvatar(
    @Request() req: { user: import('../guards/jwks-jwt.guard.js').UserContext },
    @Body() body?: {
      email?: string;
      username?: string;
      firstName?: string;
      lastName?: string;
      name?: string;
    },
  ): Promise<{
    success: boolean;
    message: string;
    avatarId: string;
    userId: string;
  }> {
    // Extract user info from Better-Auth token (populated by JwksJwtGuard)
    const userId = req.user.id;
    const email = body?.email || req.user.email;
    const name = body?.name || req.user.name;

    if (!email) {
      throw new HttpException(
        'Email is required (either in token or request body)',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Split name into firstName/lastName if provided
    let firstName = body?.firstName;
    let lastName = body?.lastName;
    if (name && !firstName && !lastName) {
      const nameParts = name.split(' ');
      firstName = nameParts[0] || '';
      lastName = nameParts.slice(1).join(' ') || '';
    }

    // Create OASIS avatar and link to user
    const avatarId = await this.authService.createOasisAvatarForUser({
      userId,
      email,
      username: body?.username || email.split('@')[0],
      firstName: firstName || '',
      lastName: lastName || '',
    });

    return {
      success: true,
      message: 'OASIS avatar created and linked successfully',
      avatarId,
      userId,
    };
  }
}
