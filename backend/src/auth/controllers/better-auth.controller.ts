import { Controller, All, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { BetterAuthService } from '../services/better-auth.service';

@Controller('auth')
export class BetterAuthController {
  constructor(private betterAuthService: BetterAuthService) {}

  @All('*')
  async handleAuth(@Req() req: Request, @Res() res: Response) {
    try {
      const handler = this.betterAuthService.getHandler();
      // Better-Auth handler expects a single request object
      // The handler is async and returns a Promise
      const result = await handler(req as any);
      return result;
    } catch (error) {
      // If Better-Auth is not initialized yet, return 503
      if (error.message?.includes('not initialized')) {
        res.status(503).json({ 
          error: 'Service temporarily unavailable',
          message: 'Better-Auth is initializing. Please try again in a moment.'
        });
        return;
      }
      throw error;
    }
  }
}

