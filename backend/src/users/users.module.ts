import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity.js';
import { UserBalance } from './entities/user-balance.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserBalance])],
  exports: [TypeOrmModule],
})
export class UsersModule {}
