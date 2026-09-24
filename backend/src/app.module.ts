import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { TasksModule } from './tasks/tasks.module.js';
import { AuthModule } from './auth/auth.module.js';

@Module({
  imports: [
    // 1. Load the system environment variables globally
    ConfigModule.forRoot({ isGlobal: true }),
    
    // 2. Configure the TypeORM connection bridge
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        const isProduction = process.env.NODE_ENV === 'production';
        
        return {
          type: 'postgres',
          username: process.env.DB_USERNAME || 'postgres',
          password: process.env.DB_PASSWORD || 'local_postgres_password',
          database: process.env.DB_NAME || 'task_tracker_poc',
          autoLoadEntities: true,
          
          // CRITICAL SAFETY FOR PRODUCTION DATA:
          // Turn off auto-synchronize in production to prevent unexpected data wiping!
          synchronize: !isProduction, 

          // Conditionally routing connection paths based on your running environment
          ...(isProduction
            ? { 
                // Set the host to the exact local Unix socket path mapped by Cloud Run
                host: `/cloudsql/${process.env.CLOUD_SQL_CONNECTION_NAME}` 
              }
            : { 
                host: process.env.DB_HOST || 'localhost',
                port: parseInt(process.env.DB_PORT || '5433', 10)
              }
          ),
        };
      },
    }),
    
    // 3. Import your individual operational feature modules
    AuthModule,
    TasksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
