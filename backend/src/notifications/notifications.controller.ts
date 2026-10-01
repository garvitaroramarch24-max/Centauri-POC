import { Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { NotificationsService } from './notifications.service.js';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findMine(@Req() request: { user: { sub: string } }) {
    return this.notificationsService.findForUser(request.user.sub);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @Req() request: { user: { sub: string } }) {
    return this.notificationsService.markAsRead(id, request.user.sub);
  }
}