import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

// Load environment variables
config();

const configService = new ConfigService();

const databaseUrl = configService.get<string>('DATABASE_URL');

const dataSourceOptions: DataSourceOptions = databaseUrl
  ? {
      type: 'postgres',
      url: databaseUrl,
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/../../migrations/*{.ts,.js}'],
    }
  : {
      type: 'postgres',
      host: configService.get<string>('DB_HOST', 'localhost'),
      port: configService.get<number>('DB_PORT', 5432),
      username: configService.get<string>('DB_USERNAME', 'user'),
      password: configService.get<string>('DB_PASSWORD', 'password'),
      database: configService.get<string>('DB_DATABASE', 'pangea'),
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/../../migrations/*{.ts,.js}'],
    };

export const AppDataSource = new DataSource(dataSourceOptions);




