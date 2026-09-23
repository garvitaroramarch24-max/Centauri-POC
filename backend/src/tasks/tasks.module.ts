
// backend/src/tasks/tasks.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksService } from './tasks.service.js'; 
import { TasksController } from './tasks.controller.js';
import { TaskEntity } from './task.entity.js';
import { AuthModule } from '../auth/auth.module.js';
import { UserEntity } from '../auth/user.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([TaskEntity, UserEntity]), AuthModule], // Registers the table repository inside this feature
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}

// import { Module } from '@nestjs/common';


// @Module({})
// export class TasksModule {}
