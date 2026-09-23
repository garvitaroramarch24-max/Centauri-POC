import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service.js'; 
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@Controller('tasks') // 1. Sets the base root URL route to http://localhost:3000/tasks
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  // 2. GET http://localhost:3000/tasks -> Fetches all tasks
  @Get()
  getAllTasks(@Req() request: { user: { sub: string } }) {
    return this.tasksService.findAll(request.user.sub);
  }

  // 3. POST http://localhost:3000/tasks -> Creates a new task
  @Post()
  createTask(
    @Body('title') title: string,
    @Body('description') description: string | undefined,
    @Req() request: { user: { sub: string } },
  ) {
    return this.tasksService.create(request.user.sub, title, description);
  }

  // 4. PATCH http://localhost:3000/tasks/:id -> Updates a task matching the ID parameter
  @Patch(':id')
  updateTask(
    @Param('id') id: string,
    @Body() updateData: { title?: string; description?: string; isCompleted?: boolean },
    @Req() request: { user: { sub: string } },
  ) {
    return this.tasksService.update(id, request.user.sub, updateData);
  }

  // 5. DELETE http://localhost:3000/tasks/:id -> Deletes a task matching the ID parameter
  @Delete(':id')
  deleteTask(@Param('id') id: string, @Req() request: { user: { sub: string } }) {
    return this.tasksService.remove(id, request.user.sub);
  }
}

// import { Controller } from '@nestjs/common';

// @Controller('tasks')
// export class TasksController {}
