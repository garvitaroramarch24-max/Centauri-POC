import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { UserEntity } from './user.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), JwtModule.register({
    secret: process.env.JWT_SECRET || 'local-development-secret-change-me',
    signOptions: { expiresIn: '1d' },
  })],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard],
  exports: [JwtAuthGuard, JwtModule],
})
export class AuthModule {}