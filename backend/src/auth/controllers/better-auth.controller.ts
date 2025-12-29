import { Controller, All, Req, Res, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { BetterAuthService } from '../services/better-auth.service';

@Controller('auth')
export class BetterAuthController {
  private readonly logger = new Logger(BetterAuthController.name);

  constructor(private betterAuthService: BetterAuthService) {}

  @All('*')
  async handleAuth(@Req() req: Request, @Res() res: Response) {
    try {
      const handler = this.betterAuthService.getHandler();
      
      // Better-Auth handler expects a request and returns a Response
      // We need to pass the request and let Better-Auth handle the response
      const response = await handler(req as any);
      
      // If Better-Auth returns a Response object, we need to handle it
      if (response instanceof Response || (response && typeof response.status === 'function')) {
        return response;
      }
      
      // Otherwise, send the response directly
      if (response) {
        return res.status(response.status || 200).json(response);
      }
      
      return res.status(200).json({ success: true });
    } catch (error) {
      this.logger.error(`Better-Auth handler error: ${error.message}`, error.stack);
      
      // If Better-Auth is not initialized yet, return 503
      if (error.message?.includes('not initialized')) {
        return res.status(503).json({ 
          error: 'Service temporarily unavailable',
          message: 'Better-Auth is initializing. Please try again in a moment.'
        });
      }
      
      // Return the error details for debugging
      return res.status(500).json({
        error: 'Internal server error',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      });
    }
  }
}

