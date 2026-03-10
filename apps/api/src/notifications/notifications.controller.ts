import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard';
import { GatewayService } from '../gateway/gateway.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private gatewayService: GatewayService) {}

  // GET /api/v1/notifications
  @Get()
  @UseGuards(FirebaseAuthGuard)
  async getNotifications(@Req() req) {
    return this.gatewayService.getNotifications(req.user.uid);
  }

  // POST /api/v1/notifications/read
  @Post('read')
  @UseGuards(FirebaseAuthGuard)
  async markRead(@Req() req) {
    await this.gatewayService.markNotificationsRead(req.user.uid);
    return { message: 'Notifications marked as read' };
  }
}