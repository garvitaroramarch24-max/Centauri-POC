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
        
        const config: any = {
          type: 'postgres',
          username: process.env.DB_USERNAME || 'postgres',
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME || 'task_tracker_poc',
          autoLoadEntities: true,
          synchronize: !isProduction,
          logging: isProduction ? false : true,
        };

        if (isProduction) {
          // Cloud Run: Use localhost (Cloud SQL proxy runs on localhost:5432)
          config.host = 'localhost';
          config.port = 5432;
        } else {
          // Local dev: Use TCP connection
          config.host = process.env.DB_HOST || 'localhost';
          config.port = parseInt(process.env.DB_PORT || '5432', 10);
        }

        return config;
      },
    }),
    
    AuthModule,
    TasksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}