import { BadRequestException } from '@nestjs/common';
import { ILike, Repository } from 'typeorm';
import { TaskEntity } from './task.entity.js';
import { TasksService } from './tasks.service.js';
import { UserEntity } from '../auth/user.entity.js';

describe('TasksService search and filters', () => {
  const find = vi.fn();
  let service: TasksService;

  beforeEach(() => {
    find.mockReset();
    find.mockResolvedValue([]);
    service = new TasksService(
      { find } as unknown as Repository<TaskEntity>,
      {} as Repository<UserEntity>,
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
});