import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { TasksService } from './tasks.service.js'; 

@Controller('tasks') // 1. Sets the base root URL route to http://localhost:3000/tasks
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  // 2. GET http://localhost:3000/tasks -> Fetches all tasks
  @Get()
  getAllTasks() {
    return this.tasksService.findAll();
  }

  // 3. POST http://localhost:3000/tasks -> Creates a new task
  @Post()
  createTask(
    @Body('title') title: string,
    @Body('description') description?: string,
  ) {
    return this.tasksService.create(title, description);
  }

  // 4. PATCH http://localhost:3000/tasks/:id -> Updates a task matching the ID parameter
  @Patch(':id')
  updateTask(
    @Param('id') id: string,
    @Body() updateData: { title?: string; description?: string; isCompleted?: boolean },
  ) {
    return this.tasksService.update(id, updateData);
  }

  // 5. DELETE http://localhost:3000/tasks/:id -> Deletes a task matching the ID parameter
  @Delete(':id')
  deleteTask(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }
}

// import { Controller } from '@nestjs/common';

// @Controller('tasks')
// export class TasksController {}
