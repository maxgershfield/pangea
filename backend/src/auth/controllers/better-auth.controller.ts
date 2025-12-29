import { Controller, All, Req, Res, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { BetterAuthService } from '../services/better-auth.service';

@Controller('auth')
export class BetterAuthController {
  private readonly logger = new Logger(BetterAuthController.name);

  constructor(private betterAuthService: BetterAuthService) {}

  // Better-Auth routes - use a single catch-all that handles all Better-Auth paths
  // Better-Auth uses paths like: /session, /sign-up/email, /sign-in/email, etc.
  // We need to catch all routes that don't match the old auth controller
  @All('*')
  async handleAuth(@Req() req: Request, @Res() res: Response) {
    // Skip if this is an old auth route
    const oldAuthRoutes = ['register', 'login', 'forgot-password', 'reset-password'];
    const path = req.url.split('?')[0].replace('/api/auth/', '');
    
    if (oldAuthRoutes.includes(path)) {
      return res.status(404).json({ error: 'Route not found' });
    }
    
    try {
      const handler = this.betterAuthService.getHandler();
      
      // Construct full URL for Better-Auth handler
      const protocol = req.get('x-forwarded-proto') === 'https' || req.secure ? 'https' : 'http';
      const host = req.get('host') || 'pangea-production-128d.up.railway.app';
      const requestPath = req.originalUrl || req.url;
      const fullUrl = `${protocol}://${host}${requestPath}`;
      
      // Get request body
      let requestBody: string | undefined;
      if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
        requestBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      }
      
      // Create Web API Request and call Better-Auth handler
      const webRequest = new Request(fullUrl, {
        method: req.method,
        headers: req.headers as HeadersInit,
        body: requestBody,
      });
      
      const webResponse = await handler(webRequest);
      
      // Handle 404 - Better-Auth route not matched
      if (webResponse.status === 404) {
        // Try using Better-Auth API directly as fallback
        if (path === 'session') {
          const auth = this.betterAuthService.getAuth();
          try {
            const session = await auth.api.getSession({ headers: req.headers });
            return res.json({ session });
          } catch (error) {
            return res.status(401).json({ session: null });
          }
        }
        return res.status(404).json({ error: 'Route not found' });
      }
      
      // Convert Web API Response to Express response
      // Copy status
      res.status(webResponse.status);
      
      // Copy headers
      webResponse.headers.forEach((value, key) => {
        res.setHeader(key, value);
      });
      
      this.logger.log('Reading response body...');
      // Get response body and send it
      const responseBody = await webResponse.text();
      this.logger.log(`Response body length: ${responseBody.length}`);
      
      // Try to parse as JSON, otherwise send as text
      try {
        const jsonBody = JSON.parse(responseBody);
        this.logger.log('Sending JSON response');
        return res.json(jsonBody);
      } catch {
        this.logger.log('Sending text response');
        return res.send(responseBody);
      }
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

