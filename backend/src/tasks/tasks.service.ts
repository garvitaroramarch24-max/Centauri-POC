import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskEntity } from './task.entity.js'; 
import { UserEntity } from '../auth/user.entity.js';

@Injectable()
export class TasksService {
  constructor(
    // 1. Inject the PostgreSQL tasks table manager repository
    @InjectRepository(TaskEntity)
    private readonly taskRepository: Repository<TaskEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  // 2. READ: Fetch all tasks sorted by the newest first
  async findAll(userId: string): Promise<TaskEntity[]> {
    return this.taskRepository.find({
      where: { owner: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  // 3. CREATE: Insert a new task record into the database
  async create(userId: string, title: string, description?: string): Promise<TaskEntity> {
    const owner = await this.userRepository.findOneByOrFail({ id: userId });
    const newTask = this.taskRepository.create({ title, description, owner });
    return this.taskRepository.save(newTask);
  }

  // 4. UPDATE: Change fields of an existing task matching an ID
  async update(id: string, userId: string, attrs: Partial<TaskEntity>): Promise<TaskEntity> {
    const task = await this.taskRepository.findOne({ where: { id, owner: { id: userId } } });
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    
    Object.assign(task, attrs);
    return this.taskRepository.save(task);
  }

  // 5. DELETE: Remove the task row from the database completely
  async remove(id: string, userId: string): Promise<void> {
    const result = await this.taskRepository.delete({ id, owner: { id: userId } });
    if (result.affected === 0) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
  }
}


