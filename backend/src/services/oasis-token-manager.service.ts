import { Injectable, Logger, Inject, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import axios, { AxiosInstance } from 'axios';

interface TokenInfo {
  token: string;
  expiresAt: number; // Unix timestamp
  avatarId?: string;
}

/**
 * Service to manage OASIS API token lifecycle
 * Automatically refreshes token before expiration
 */
@Injectable()
export class OasisTokenManagerService implements OnModuleInit {
  private readonly logger = new Logger(OasisTokenManagerService.name);
  private readonly baseUrl: string;
  private readonly adminUsername: string;
  private readonly adminPassword: string;
  private readonly axiosInstance: AxiosInstance;
  private readonly TOKEN_CACHE_KEY = 'oasis:api:token';
  private readonly TOKEN_EXPIRY_BUFFER = 5 * 60; // Refresh 5 minutes before expiry

  constructor(
    private configService: ConfigService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {
    this.baseUrl =
      this.configService.get<string>('OASIS_API_URL') ||
      'http://api.oasisweb4.com';
    this.adminUsername =
      this.configService.get<string>('OASIS_ADMIN_USERNAME') ||
      'OASIS_ADMIN';
    this.adminPassword =
      this.configService.get<string>('OASIS_ADMIN_PASSWORD') ||
      'Uppermall1!';

    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
  }

  /**
   * Initialize token on module start
   * Non-blocking - app will start even if this fails
   */
  async onModuleInit() {
    // Run initialization in background, don't block app startup
    setImmediate(async () => {
      try {
        // Try to get existing token from cache
        const cachedToken = await this.getCachedToken();
        if (cachedToken && !this.isTokenExpiring(cachedToken)) {
          this.logger.log('Using cached OASIS API token');
          return;
        }

        // Fetch new token if cache is empty or expired
        this.logger.log('Fetching new OASIS API token...');
        await this.refreshToken();
      } catch (error) {
        this.logger.warn(
          `Failed to initialize OASIS token on startup: ${error.message}. Token will be fetched on first use.`,
        );
        // Don't throw - allow app to start, token will be fetched when needed
      }
    });
  }

  /**
   * Get current valid token, refreshing if necessary
   */
  async getToken(): Promise<string> {
    try {
      // Try to get from cache
      const cachedToken = await this.getCachedToken();

      if (cachedToken && !this.isTokenExpiring(cachedToken)) {
        return cachedToken.token;
      }

      // Token is missing or expiring soon, refresh it
      this.logger.log('Token expired or expiring soon, refreshing...');
      const newToken = await this.refreshToken();
      return newToken.token;
    } catch (error) {
      this.logger.error(
        `Failed to get OASIS token: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Refresh the OASIS API token by authenticating with admin credentials
   */
  async refreshToken(): Promise<TokenInfo> {
    try {
      this.logger.log(
        `Authenticating with OASIS API as ${this.adminUsername}...`,
      );

      const response = await this.axiosInstance.post('/api/avatar/authenticate', {
        username: this.adminUsername,
        password: this.adminPassword,
      });

      // Extract token from nested response structure
      const data = response.data;
      const result: any = data.result || data;
      const avatar =
        result.Result || result.result || result || data;

      const token =
        avatar.jwtToken ||
        avatar.JwtToken ||
        result.jwtToken ||
        data.jwtToken ||
        data.token;

      if (!token) {
        this.logger.error('No token in response:', JSON.stringify(data, null, 2));
        throw new Error('No token received from OASIS API');
      }

      // Decode JWT to get expiration
      const payload = this.decodeJwtPayload(token);
      const expiresAt = payload.exp * 1000; // Convert to milliseconds

      const tokenInfo: TokenInfo = {
        token,
        expiresAt,
        avatarId: payload.id || avatar.avatarId || avatar.id,
      };

      // Cache the token
      await this.cacheToken(tokenInfo);

      const expiresIn = Math.floor((expiresAt - Date.now()) / 1000 / 60);
      this.logger.log(
        `✅ OASIS API token refreshed successfully. Expires in ${expiresIn} minutes`,
      );

      return tokenInfo;
    } catch (error: any) {
      this.logger.error(
        `Failed to refresh OASIS token: ${error.message}`,
        error.response?.data || error.stack,
      );
      throw new Error(
        `Failed to refresh OASIS API token: ${error.message}`,
      );
    }
  }

  /**
   * Check if token is expiring soon
   */
  private isTokenExpiring(tokenInfo: TokenInfo): boolean {
    const now = Date.now();
    const expiresAt = tokenInfo.expiresAt;
    const timeUntilExpiry = expiresAt - now;
    return timeUntilExpiry < this.TOKEN_EXPIRY_BUFFER * 1000;
  }

  /**
   * Get cached token from Redis
   */
  private async getCachedToken(): Promise<TokenInfo | null> {
    try {
      const cached = await this.redis.get(this.TOKEN_CACHE_KEY);
      if (!cached) {
        return null;
      }

      const tokenInfo: TokenInfo = JSON.parse(cached);
      
      // Check if token is still valid
      if (Date.now() >= tokenInfo.expiresAt) {
        this.logger.log('Cached token has expired');
        return null;
      }

      return tokenInfo;
    } catch (error) {
      this.logger.warn(`Failed to get cached token: ${error.message}`);
      return null;
    }
  }

  /**
   * Cache token in Redis
   */
  private async cacheToken(tokenInfo: TokenInfo): Promise<void> {
    try {
      const ttl = Math.floor((tokenInfo.expiresAt - Date.now()) / 1000);
      if (ttl > 0) {
        await this.redis.setex(
          this.TOKEN_CACHE_KEY,
          ttl,
          JSON.stringify(tokenInfo),
        );
        this.logger.debug(`Token cached with TTL: ${ttl} seconds`);
      }
    } catch (error) {
      this.logger.warn(`Failed to cache token: ${error.message}`);
      // Don't throw - token is still valid, just not cached
    }
  }

  /**
   * Decode JWT payload to extract expiration
   */
  private decodeJwtPayload(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }

      const payload = JSON.parse(
        Buffer.from(parts[1], 'base64').toString('utf-8'),
      );
      return payload;
    } catch (error) {
      this.logger.error(`Failed to decode JWT: ${error.message}`);
      throw new Error('Invalid JWT token format');
    }
  }

  /**
   * Force token refresh (useful for manual refresh)
   */
  async forceRefresh(): Promise<TokenInfo> {
    this.logger.log('Force refreshing OASIS API token...');
    return this.refreshToken();
  }
}
