import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard';
import { GatewayService } from '../gateway/gateway.service';

@Controller('messages')
export class MessagesController {
  constructor(private gatewayService: GatewayService) {}

  // GET /api/v1/messages/conversations
  @Get('conversations')
  @UseGuards(FirebaseAuthGuard)
  async getConversations(@Req() req) {
    return this.gatewayService.getConversations(req.user.uid);
  }

  // GET /api/v1/messages/:uid
  @Get(':uid')
  @UseGuards(FirebaseAuthGuard)
  async getMessages(@Param('uid') otherUid: string, @Req() req) {
    return this.gatewayService.getMessages(req.user.uid, otherUid);
  }
}