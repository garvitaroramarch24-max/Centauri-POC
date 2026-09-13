import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskEntity } from './task.entity.js'; 

@Injectable()
export class TasksService {
  constructor(
    // 1. Inject the PostgreSQL tasks table manager repository
    @InjectRepository(TaskEntity)
    private readonly taskRepository: Repository<TaskEntity>,
  ) {}

  // 2. READ: Fetch all tasks sorted by the newest first
  async findAll(): Promise<TaskEntity[]> {
    return this.taskRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  // 3. CREATE: Insert a new task record into the database
  async create(title: string, description?: string): Promise<TaskEntity> {
    const newTask = this.taskRepository.create({ title, description });
    return this.taskRepository.save(newTask);
  }

  // 4. UPDATE: Change fields of an existing task matching an ID
  async update(id: string, attrs: Partial<TaskEntity>): Promise<TaskEntity> {
    const task = await this.taskRepository.findOne({ where: { id } });
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    
    Object.assign(task, attrs);
    return this.taskRepository.save(task);
  }

  // 5. DELETE: Remove the task row from the database completely
  async remove(id: string): Promise<void> {
    const result = await this.taskRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
  }
}

// import { Injectable } from '@nestjs/common';

// @Injectable()
// export class TasksService {}
