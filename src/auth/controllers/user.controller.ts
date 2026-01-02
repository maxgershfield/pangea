import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { AuthService } from '../services/auth.service.js';
import { JwksJwtGuard, UserContext } from '../guards/jwks-jwt.guard.js';
import { CurrentUser } from '../decorators/session-auth.decorators.js';
import { User } from '../../users/entities/user.entity.js';

@Controller('user')
@UseGuards(JwksJwtGuard)
export class UserController {
  constructor(private authService: AuthService) {}

  /**
   * Get current user profile
   * GET /api/user/profile
   */
  @Get('profile')
  async getProfile(@CurrentUser() user: UserContext): Promise<User> {
    return this.authService.getProfile(user.id);
  }

  /**
   * Update user profile
   * PUT /api/user/profile
   */
  @Put('profile')
  async updateProfile(
    @CurrentUser() user: UserContext,
    @Body() updateData: { firstName?: string; lastName?: string; email?: string },
  ): Promise<User> {
    return this.authService.updateProfile(user.id, updateData);
  }
}
