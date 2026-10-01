import { BadRequestException } from '@nestjs/common';
import { ILike, Repository } from 'typeorm';
import { TaskEntity } from './task.entity.js';
import { TasksService } from './tasks.service.js';
import { UserEntity } from '../auth/user.entity.js';

describe('TasksService search and filters', () => {
  const find = vi.fn();
  const findOne = vi.fn();
  const findOneByOrFail = vi.fn();
  const create = vi.fn();
  const save = vi.fn();
  const notificationsService = {
    notifyTaskCreated: vi.fn(),
    notifyTaskCompleted: vi.fn(),
  };
  let service: TasksService;

  beforeEach(() => {
    find.mockReset();
    find.mockResolvedValue([]);
    findOne.mockReset();
    findOneByOrFail.mockReset();
    create.mockReset();
    save.mockReset();
    notificationsService.notifyTaskCreated.mockReset();
    notificationsService.notifyTaskCompleted.mockReset();
    service = new TasksService(
      { find, findOne, create, save } as unknown as Repository<TaskEntity>,
      { findOneByOrFail } as unknown as Repository<UserEntity>,
      notificationsService,
    );
  });

  it('searches titles and descriptions within the authenticated owner and status', async () => {
    await service.findAll('owner-1', { query: '  roadmap  ', status: 'open' });

    const options = find.mock.calls[0][0];
    expect(options.where).toEqual([
      {
        owner: { id: 'owner-1' },
        isCompleted: false,
        title: ILike('%roadmap%'),
      },
      {
        owner: { id: 'owner-1' },
        isCompleted: false,
        description: ILike('%roadmap%'),
      },
    ]);
    expect(options.order).toEqual({ createdAt: 'DESC' });
  });

  it('returns all of the owner\'s tasks when search and status filters are omitted', async () => {
    await service.findAll('owner-1');

    expect(find.mock.calls[0][0].where).toEqual([{ owner: { id: 'owner-1' } }]);
  });

  it('treats wildcard characters in search text literally', async () => {
    await service.findAll('owner-1', { query: '100%_done' });

    expect(find.mock.calls[0][0].where).toEqual([
      { owner: { id: 'owner-1' }, title: ILike('%100\\%\\_done%') },
      { owner: { id: 'owner-1' }, description: ILike('%100\\%\\_done%') },
    ]);
  });

  it('rejects unknown task statuses', async () => {
    await expect(service.findAll('owner-1', { status: 'pending' })).rejects.toThrow(
      BadRequestException,
    );
    expect(find).not.toHaveBeenCalled();
  });

  it('notifies the owner after creating a task', async () => {
    const task = { title: 'Review proposal' } as TaskEntity;
    findOneByOrFail.mockResolvedValue({ id: 'owner-1' });
    create.mockReturnValue(task);
    save.mockResolvedValue(task);

    await service.create('owner-1', task.title);

    expect(notificationsService.notifyTaskCreated).toHaveBeenCalledWith(
      'owner-1',
      task.title,
    );
  });

  it('notifies the owner when a task is first completed', async () => {
    const task = { id: 'task-1', title: 'Review proposal', isCompleted: false } as TaskEntity;
    findOne.mockResolvedValue(task);
    save.mockResolvedValue({ ...task, isCompleted: true });

    await service.update('task-1', 'owner-1', { isCompleted: true });

    expect(notificationsService.notifyTaskCompleted).toHaveBeenCalledWith(
      'owner-1',
      task.title,
    );
  });
});