import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { TasksModule } from './tasks/tasks.module.js';

@Module({
  imports: [
    // 1. Load the system environment variables from your .env file globally
    ConfigModule.forRoot({ isGlobal: true }),
    
    // 2. Configure the TypeORM connection bridge to your Docker Postgres instance
    // TypeOrmModule.forRoot({
    //   type: 'postgres',
    //   host: process.env.DB_HOST || 'localhost',
    //   port: parseInt(process.env.DB_PORT || '5432', 10),
    //   username: process.env.DB_USERNAME || 'postgres',
    //   password: process.env.DB_PASSWORD || 'root',
    //   database: process.env.DB_NAME || 'postgres',
    //   autoLoadEntities: true,
    //   synchronize: true, // Automatically manages database table schemas on start
    // }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5433', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'local_postgres_password',
      database: process.env.DB_NAME || 'task_tracker_poc',
      autoLoadEntities: true,
      synchronize: true, // Automatically manages database table schemas on start
    }),
    
    // 3. Import your individual task operational feature module
    TasksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

