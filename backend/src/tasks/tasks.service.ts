import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
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

  async findAll(
    userId: string,
    filters: { query?: string; status?: string } = {},
  ): Promise<TaskEntity[]> {
    const isCompleted = this.getCompletionFilter(filters.status);
    const searchTerm = filters.query?.trim().replace(/[\\%_]/g, '\\$&');
    const ownerFilter = {
      owner: { id: userId },
      ...(isCompleted === undefined ? {} : { isCompleted }),
    };
    const where = searchTerm
      ? [
          { ...ownerFilter, title: ILike(`%${searchTerm}%`) },
          { ...ownerFilter, description: ILike(`%${searchTerm}%`) },
        ]
      : [ownerFilter];

    return this.taskRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  private getCompletionFilter(status = 'all'): boolean | undefined {
    switch (status) {
      case 'all':
        return undefined;
      case 'open':
        return false;
      case 'completed':
        return true;
      default:
        throw new BadRequestException('Status must be all, open, or completed');
    }
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


