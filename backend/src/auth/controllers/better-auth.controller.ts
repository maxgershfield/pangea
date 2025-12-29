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
      
      // Better-Auth handler expects a Web API Request
      // Construct the full URL - Better-Auth needs the complete URL including basePath
      const protocol = req.secure || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
      const host = req.get('host') || 'pangea-production-128d.up.railway.app';
      const requestPath = req.originalUrl || req.url;
      const fullUrl = `${protocol}://${host}${requestPath}`;
      
      // Get request body if present
      let requestBody: string | undefined;
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        if (req.body) {
          requestBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
        }
      }
      
      // Create Web API Request - Better-Auth will match routes based on the URL path
      const webRequest = new Request(fullUrl, {
        method: req.method,
        headers: req.headers as HeadersInit,
        body: requestBody,
      });
      
      // Call Better-Auth handler
      const webResponse = await handler(webRequest);
      
      // If 404, Better-Auth isn't matching the route
      // This could mean the basePath configuration isn't working
      if (webResponse.status === 404) {
        this.logger.error(`Better-Auth 404: Could not match route ${requestPath}`);
        return res.status(404).json({
          error: 'Route not found',
          message: `Better-Auth could not match: ${requestPath}`,
        });
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

