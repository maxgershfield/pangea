import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { webcrypto } from 'node:crypto';

// Ensure Web Crypto API is available for Better-Auth
// Better-Auth (ES module) expects crypto to be available globally
if (typeof globalThis.crypto === 'undefined') {
  globalThis.crypto = webcrypto as any;
}
if (typeof (global as any).crypto === 'undefined') {
  (global as any).crypto = webcrypto;
}

export async function createBetterAuth(dataSource: DataSource, configService: ConfigService) {
  // Dynamic import for ES module - use eval to prevent TypeScript from transforming to require()
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  const betterAuthModule = await (new Function('return import("better-auth")'))();
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  const adapterModule = await (new Function('return import("@hedystia/better-auth-typeorm")'))();
  
  const { betterAuth } = betterAuthModule;
  const { typeormAdapter } = adapterModule;
  
  return betterAuth({
    database: typeormAdapter(dataSource, {
      // Configure adapter to generate IDs for sessions
      generateId: true,
      // Enable debug logs to see what queries are being made
      debugLogs: true,
    }),
    
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false, // Set to true in production
    },
    
    socialProviders: {
      google: {
        clientId: configService.get<string>('GOOGLE_CLIENT_ID') || '',
        clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') || '',
      },
      github: {
        clientId: configService.get<string>('GITHUB_CLIENT_ID') || '',
        clientSecret: configService.get<string>('GITHUB_CLIENT_SECRET') || '',
      },
      // Add more providers as needed
    },
    
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // 1 day
    },
    
    advanced: {
      useSecureCookies: process.env.NODE_ENV === 'production',
      cookiePrefix: 'pangea',
    },
    
    // Base URL for callbacks - should be the full URL without the path
    baseURL: configService.get<string>('BASE_URL') || 'https://pangea-production-128d.up.railway.app',
    // basePath should match where the handler is mounted
    // Since we're mounting at /api/auth, basePath should be /api/auth
    basePath: '/api/auth',
    secret: configService.get<string>('BETTER_AUTH_SECRET') || 'change-me-in-production',
    // Trust proxy for Railway (behind reverse proxy)
    trustProxy: true,
  });
}

