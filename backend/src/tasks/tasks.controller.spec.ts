import { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { TasksController } from './tasks.controller.js';
import { TasksService } from './tasks.service.js';

describe('TasksController search endpoint', () => {
  let app: INestApplication<App>;
  const findAll = vi.fn();

  beforeEach(async () => {
    findAll.mockReset();
    findAll.mockResolvedValue([]);

    const moduleBuilder = Test.createTestingModule({
      controllers: [TasksController],
      providers: [{ provide: TasksService, useValue: { findAll } }],
    });
    const module = await moduleBuilder
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          context.switchToHttp().getRequest().user = { sub: 'owner-1' };
          return true;
        },
      })
      .compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    if (app) await app.close();
  });

  it('passes search and status query parameters with the authenticated owner', async () => {
    await request(app.getHttpServer())
      .get('/tasks?q=weekly%20sync&status=open')
      .expect(200)
      .expect([]);

    expect(findAll).toHaveBeenCalledWith('owner-1', {
      query: 'weekly sync',
      status: 'open',
    });
  });

  it('defaults to an unfiltered list when query parameters are absent', async () => {
    await request(app.getHttpServer()).get('/tasks').expect(200).expect([]);

    expect(findAll).toHaveBeenCalledWith('owner-1', {
      query: undefined,
      status: undefined,
    });
  });

  it('returns a summary for the authenticated owner', async () => {
    findAll.mockResolvedValueOnce([{ isCompleted: true }, { isCompleted: false }]);

    await request(app.getHttpServer())
      .get('/tasks/summary')
      .expect(200)
      .expect({ total: 2, completed: 1, open: 1 });

    expect(findAll).toHaveBeenCalledWith('owner-1');
  });
});