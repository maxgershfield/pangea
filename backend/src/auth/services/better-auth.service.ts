import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { createBetterAuth } from '../better-auth.config';

@Injectable()
export class BetterAuthService implements OnModuleInit {
  private auth: Awaited<ReturnType<typeof createBetterAuth>> | null = null;

  constructor(
    private dataSource: DataSource,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    // Initialize Better-Auth asynchronously using dynamic import
    this.auth = await createBetterAuth(this.dataSource, this.configService);
  }

  getAuth() {
    if (!this.auth) {
      throw new Error('Better-Auth not initialized. Make sure onModuleInit has completed.');
    }
    return this.auth;
  }

  getHandler() {
    if (!this.auth) {
      throw new Error('Better-Auth not initialized. Make sure onModuleInit has completed.');
    }
    return this.auth.handler;
  }
}

