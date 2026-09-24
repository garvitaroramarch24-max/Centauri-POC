import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { TasksModule } from './tasks/tasks.module.js';
import { AuthModule } from './auth/auth.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        const isProduction = process.env.NODE_ENV === 'production';
        
        return {
          type: 'postgres',
          username: process.env.DB_USERNAME || 'postgres',
          password: process.env.DB_PASSWORD || 'local_postgres_password',
          database: process.env.DB_NAME || 'task_tracker_poc',
          autoLoadEntities: true,
          synchronize: !isProduction, // Crucial safety for production data

          // ADJUSTMENT: Use standard TCP host connection configurations
          host: isProduction ? '127.0.0.1' : (process.env.DB_HOST || 'localhost'),
          port: isProduction ? 5432 : parseInt(process.env.DB_PORT || '5433', 10),
          
          // Extra driver flags to ensure stability on Cloud Run container runtimes
          extra: isProduction ? {
            connectTimeoutMS: 10000,
          } : {},
        };
      },
    }),
    
    AuthModule,
    TasksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
