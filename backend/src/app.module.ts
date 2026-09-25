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
          host: isProduction ? 'localhost' : (process.env.DB_HOST || 'localhost'),
          port: isProduction ? 5432 : parseInt(process.env.DB_PORT || '5432', 10),
          username: process.env.DB_USERNAME || 'postgres',
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME || 'task_tracker_poc',
          autoLoadEntities: true,
          synchronize: !isProduction,
          logging: !isProduction,
          // CRITICAL: Don't crash if DB isn't available on startup
          retryAttempts: 10,
          retryDelay: 2000,
          connectTimeoutMS: 10000,
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