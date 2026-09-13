
// backend/src/tasks/tasks.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksService } from './tasks.service.js'; 
import { TasksController } from './tasks.controller.js';
import { TaskEntity } from './task.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([TaskEntity])], // Registers the table repository inside this feature
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}

// import { Module } from '@nestjs/common';


// @Module({})
// export class TasksModule {}
