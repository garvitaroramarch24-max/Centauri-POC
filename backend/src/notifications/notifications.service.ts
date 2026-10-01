import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationEntity } from './notification.entity.js';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationRepository: Repository<NotificationEntity>,
  ) {}

  notifyTaskCreated(userId: string, title: string) {
    return this.create(userId, 'task_created', `Task "${title}" was created.`);
  }

  notifyTaskCompleted(userId: string, title: string) {
    return this.create(userId, 'task_completed', `Task "${title}" was completed.`);
  }

  findForUser(userId: string) {
    return this.notificationRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(id: string, userId: string) {
    const notification = await this.notificationRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    notification.isRead = true;
    return this.notificationRepository.save(notification);
  }

  private create(userId: string, type: NotificationEntity['type'], message: string) {
    const notification = this.notificationRepository.create({
      type,
      message,
      user: { id: userId },
    });
    return this.notificationRepository.save(notification);
  }
}