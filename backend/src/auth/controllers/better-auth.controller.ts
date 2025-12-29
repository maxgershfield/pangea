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
    this.logger.log(`Better-Auth handler called for: ${req.method} ${req.url}`);
    
    // Skip if this is an old auth route (register, login, forgot-password, reset-password)
    const oldAuthRoutes = ['register', 'login', 'forgot-password', 'reset-password'];
    const path = req.url.split('?')[0].replace('/api/auth/', '');
    
    this.logger.log(`Path after processing: ${path}`);
    
    if (oldAuthRoutes.includes(path)) {
      // Let the old auth controller handle it
      this.logger.log(`Skipping old auth route: ${path}`);
      return res.status(404).json({ error: 'Route not found' });
    }
    
    this.logger.log(`Processing Better-Auth route: ${path}`);
    try {
      this.logger.log('Getting Better-Auth handler...');
      const handler = this.betterAuthService.getHandler();
      this.logger.log('Handler obtained, creating Web API Request...');
      
      // Better-Auth handler expects a Web API Request and returns a Web API Response
      // Convert Express request to Web API Request
      // Construct full URL from Express request
      const protocol = req.protocol || 'https';
      const host = req.get('host') || 'pangea-production-128d.up.railway.app';
      // Better-Auth expects the full path including basePath
      const fullUrl = `${protocol}://${host}${req.originalUrl || req.url}`;
      
      this.logger.log(`Full URL: ${fullUrl}`);
      this.logger.log(`Request path: ${req.path}`);
      this.logger.log(`Request originalUrl: ${req.originalUrl}`);
      this.logger.log(`Request url: ${req.url}`);
      
      // Get request body if present
      let requestBody: string | undefined;
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        if (req.body) {
          requestBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
          this.logger.log(`Request body: ${requestBody.substring(0, 100)}...`);
        } else if (req.readable) {
          // For stream-based bodies, we'd need to read them differently
          // But Better-Auth should handle this via the request object
          requestBody = undefined;
        }
      }
      
      this.logger.log('Creating Web API Request object...');
      const webRequest = new Request(fullUrl, {
        method: req.method,
        headers: req.headers as HeadersInit,
        body: requestBody,
      });
      
      this.logger.log('Calling Better-Auth handler...');
      // Call Better-Auth handler
      const webResponse = await handler(webRequest);
      this.logger.log(`Better-Auth handler returned status: ${webResponse.status}`);
      
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

