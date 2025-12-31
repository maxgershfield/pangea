import { Controller, All, Req, Res, Logger } from '@nestjs/common';
import { Request, Response as ExpressResponse } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { BetterAuthService } from '../services/better-auth.service';

// Web API Response type (from fetch API)
type WebResponse = globalThis.Response;

@Controller('auth')
export class BetterAuthController {
  private readonly logger = new Logger(BetterAuthController.name);

  constructor(
    private betterAuthService: BetterAuthService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // Better-Auth routes - use a single catch-all that handles all Better-Auth paths
  // Better-Auth uses paths like: /session, /sign-up/email, /sign-in/email, etc.
  // We need to catch all routes that don't match the old auth controller
  @All('*')
  async handleAuth(@Req() req: Request, @Res() res: ExpressResponse) {
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
      
      // Get request body - Express body parser should have parsed it
      let requestBody: string | undefined;
      let parsedBody: any = req.body;
      
      if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
        requestBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      }
      
      // Create Web API Request and call Better-Auth handler
      const webRequest = new Request(fullUrl, {
        method: req.method,
        headers: req.headers as HeadersInit,
        body: requestBody,
      });
      
      let webResponse: WebResponse;
      try {
        webResponse = await handler(webRequest);
      } catch (handlerError: any) {
        this.logger.error(`Better-Auth handler threw error for ${path}: ${handlerError.message}`, handlerError.stack);
        return res.status(500).json({
          error: 'Handler error',
          message: handlerError.message || 'Unknown handler error',
          path: path,
        });
      }
      
      // Intercept successful sign-up/sign-in responses to add JWT token
      // Check if this is a sign-up or sign-in endpoint
      const isSignUpOrSignIn = path.startsWith('sign-up/') || path.startsWith('sign-in/');
      
      if ((webResponse.status === 200 || webResponse.status === 201) && isSignUpOrSignIn) {
        this.logger.log(`Intercepting ${path} response to add JWT token`);
        try {
          // Clone response to read body without consuming it
          const clonedResponse = webResponse.clone();
          const responseBody = await clonedResponse.text();
          const jsonBody = JSON.parse(responseBody);
          
          // Check if this is a sign-up or sign-in response that needs JWT token
          if (jsonBody.user) {
            this.logger.log(`Generating JWT token for user: ${jsonBody.user.email}`);
            // Generate JWT token for the response (as per Rishav's requirement)
            const jwtToken = this.generateJwtToken(jsonBody.user);
            const expiresAt = this.getTokenExpiration();
            
            // Copy headers from original response
            webResponse.headers.forEach((value, key) => {
              res.setHeader(key, value);
            });
            
            // Return response with JWT token
            this.logger.log(`Returning response with JWT token for ${path}`);
            return res.status(webResponse.status).json({
              user: {
                id: jsonBody.user.id,
                email: jsonBody.user.email,
                username: jsonBody.user.email?.split('@')[0] || jsonBody.user.name,
                name: jsonBody.user.name || undefined,
                avatarId: '', // Will be set when OASIS avatar is created
                role: 'user',
              },
              token: jwtToken,
              accessToken: jwtToken, // Also include as accessToken for compatibility
              expiresAt,
            });
          } else {
            this.logger.warn(`Response for ${path} does not contain user object`);
          }
        } catch (error: any) {
          // Not JSON or parsing failed, continue with original response
          this.logger.warn(`Failed to parse response for JWT injection (${path}): ${error.message}`);
          // If it's a sign-in/sign-up and we can't parse, log the error but continue
          if (isSignUpOrSignIn) {
            this.logger.error(`Failed to inject JWT for ${path}, returning original response. Error: ${error.message}`);
          }
        }
      }
      
      // Log if sign-in/sign-up didn't get intercepted (for debugging)
      if (isSignUpOrSignIn && webResponse.status !== 200 && webResponse.status !== 201) {
        this.logger.warn(`Sign-in/sign-up returned status ${webResponse.status} for path: ${path}`);
        // Try to read the error response body for debugging
        try {
          const errorBody = await webResponse.clone().text();
          this.logger.warn(`Error response body: ${errorBody}`);
        } catch (e) {
          this.logger.warn(`Could not read error response body: ${e}`);
        }
      }
      
      // Handle 404 - Better-Auth handler route not matched
      // Use Better-Auth API methods directly as fallback
      if (webResponse.status === 404) {
        const auth = this.betterAuthService.getAuth();
        
        // Handle specific Better-Auth endpoints using API methods
        if (path === 'session' && req.method === 'GET') {
          try {
            const session = await auth.api.getSession({ headers: req.headers });
            return res.json({ session });
          } catch (error) {
            return res.status(401).json({ session: null });
          }
        }
        
        // Handle sign-up
        if (path.startsWith('sign-up/') && req.method === 'POST') {
          const provider = path.replace('sign-up/', '');
          if (provider === 'email' && parsedBody) {
            try {
              const result = await auth.api.signUpEmail({
                body: {
                  email: parsedBody.email,
                  password: parsedBody.password,
                  name: parsedBody.name,
                },
                headers: req.headers,
              });
              
              // Generate JWT token for response (as per Rishav's requirement)
              if (result.user) {
                const jwtToken = this.generateJwtToken(result.user);
                return res.status(201).json({
                  user: {
                    id: result.user.id,
                    email: result.user.email,
                    username: result.user.email.split('@')[0], // Use email prefix as username
                    name: result.user.name || undefined,
                    avatarId: '', // Will be set when OASIS avatar is created
                    role: 'user',
                  },
                  token: jwtToken,
                  accessToken: jwtToken, // Also include as accessToken for compatibility
                  expiresAt: this.getTokenExpiration(),
                });
              }
              
              return res.status(201).json(result);
            } catch (error: any) {
              return res.status(400).json({ error: error.message });
            }
          }
        }
        
        // Handle sign-in
        if (path.startsWith('sign-in/') && req.method === 'POST') {
          const provider = path.replace('sign-in/', '');
          if (provider === 'email' && parsedBody) {
            try {
              const result = await auth.api.signInEmail({
                body: {
                  email: parsedBody.email,
                  password: parsedBody.password,
                },
                headers: req.headers,
              });
              
              // Generate JWT token for response (as per Rishav's requirement)
              if (result.user) {
                const jwtToken = this.generateJwtToken(result.user);
                return res.json({
                  user: {
                    id: result.user.id,
                    email: result.user.email,
                    username: result.user.email.split('@')[0], // Use email prefix as username
                    name: result.user.name || undefined,
                    avatarId: '', // Will be set when OASIS avatar is created
                    role: 'user',
                  },
                  token: jwtToken,
                  accessToken: jwtToken, // Also include as accessToken for compatibility
                  expiresAt: this.getTokenExpiration(),
                });
              }
              
              return res.json(result);
            } catch (error: any) {
              this.logger.error(`Sign-in error: ${error.message}`, error.stack);
              return res.status(401).json({ error: error.message || 'Invalid credentials' });
            }
          }
        }
        
        // Handle sign-out
        if (path === 'sign-out' && req.method === 'POST') {
          try {
            await auth.api.signOut({ headers: req.headers });
            return res.json({ success: true });
          } catch (error: any) {
            return res.status(400).json({ error: error.message });
          }
        }
        
        // Handle user endpoint
        if (path === 'user' && req.method === 'GET') {
          try {
            const session = await auth.api.getSession({ headers: req.headers });
            if (!session?.user) {
              return res.status(401).json({ error: 'Not authenticated' });
            }
            return res.json({ user: session.user });
          } catch (error: any) {
            return res.status(401).json({ error: error.message });
          }
        }
        
        // Unknown route
        return res.status(404).json({ error: 'Route not found' });
      }
      
      // Convert Web API Response to Express response
      // Copy status (webResponse.status is a number)
      const statusCode: number = webResponse.status;
      res.status(statusCode);

      // Copy headers (webResponse.headers is a Headers object from Web API)
      webResponse.headers.forEach((value, key) => {
        res.setHeader(key, value);
      });

      this.logger.log('Reading response body...');
      // Get response body and send it
      // Note: responseBody was already read above if it was a sign-up/sign-in, so we need to clone
      // For now, read it again (we'll optimize later if needed)
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
      this.logger.error(`Better-Auth handler error for path ${path}: ${error.message}`, error.stack);
      
      // If Better-Auth is not initialized yet, return 503
      if (error.message?.includes('not initialized')) {
        return res.status(503).json({ 
          error: 'Service temporarily unavailable',
          message: 'Better-Auth is initializing. Please try again in a moment.'
        });
      }
      
      // Return the error details for debugging
      // Make sure we always send a response, even if there's an error
      if (!res.headersSent) {
        return res.status(500).json({
          error: 'Internal server error',
          message: error.message || 'Unknown error',
          path: path,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        });
      } else {
        // Headers already sent, log the error
        this.logger.error('Response headers already sent, cannot send error response');
      }
    }
  }

  /**
   * Generate JWT token for Better-Auth user (as per Rishav's requirement)
   */
  private generateJwtToken(user: { id: string; email: string; name?: string | null }): string {
    const payload = {
      sub: user.id,
      email: user.email,
      username: user.email.split('@')[0],
      name: user.name || undefined,
      role: 'user',
    };

    return this.jwtService.sign(payload);
  }

  /**
   * Get token expiration date
   */
  private getTokenExpiration(): Date {
    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN') || '7d';
    const now = new Date();
    if (expiresIn.endsWith('d')) {
      const days = parseInt(expiresIn);
      now.setDate(now.getDate() + days);
    } else if (expiresIn.endsWith('h')) {
      const hours = parseInt(expiresIn);
      now.setHours(now.getHours() + hours);
    } else if (expiresIn.endsWith('m')) {
      const minutes = parseInt(expiresIn);
      now.setMinutes(now.getMinutes() + minutes);
    } else {
      // Default to 7 days
      now.setDate(now.getDate() + 7);
    }
    return now;
  }
}

