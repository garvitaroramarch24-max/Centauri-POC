import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { NotificationEntity } from './notification.entity.js';
import { NotificationsService } from './notifications.service.js';

describe('NotificationsService', () => {
  const find = vi.fn();
  const findOne = vi.fn();
  const save = vi.fn();
  let service: NotificationsService;

  beforeEach(() => {
    find.mockReset();
    findOne.mockReset();
    save.mockReset();
    service = new NotificationsService({ find, findOne, save } as unknown as Repository<NotificationEntity>);
  });

  it('lists only the authenticated user\'s notifications', async () => {
    find.mockResolvedValue([]);

    await service.findForUser('owner-1');

    expect(find).toHaveBeenCalledWith({
      where: { user: { id: 'owner-1' } },
      order: { createdAt: 'DESC' },
    });
  });

  it('does not mark another user\'s notification as read', async () => {
    findOne.mockResolvedValue(null);

    await expect(service.markAsRead('notification-1', 'owner-1')).rejects.toThrow(
      NotFoundException,
    );
    expect(findOne).toHaveBeenCalledWith({
      where: { id: 'notification-1', user: { id: 'owner-1' } },
    });
    expect(save).not.toHaveBeenCalled();
  });
});