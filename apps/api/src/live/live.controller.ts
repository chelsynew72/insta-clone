import { Controller, Post, Get, Delete, Param, Req, UseGuards, Body } from '@nestjs/common';
import { LiveService } from './live.service';
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard';

@Controller('live')
export class LiveController {
  constructor(private liveService: LiveService) {}

  // POST /api/v1/live/start
  @Post('start')
  @UseGuards(FirebaseAuthGuard)
  async startLive(@Req() req: any, @Body('title') title: string = '') {
    return this.liveService.startLive(req.user.uid, title);
  }

  // DELETE /api/v1/live/end
  @Delete('end')
  @UseGuards(FirebaseAuthGuard)
  async endLive(@Req() req: any) {
    await this.liveService.endLive(req.user.uid);
    return { message: 'Live ended' };
  }

  // GET /api/v1/live
  @Get()
  @UseGuards(FirebaseAuthGuard)
  async getActiveLives() {
    return this.liveService.getActiveLives();
  }

  // GET /api/v1/live/:channelName
  @Get(':channelName')
  @UseGuards(FirebaseAuthGuard)
  async getLive(@Param('channelName') channelName: string) {
    return this.liveService.getLiveByChannel(channelName);
  }

  // POST /api/v1/live/:channelName/join
  @Post(':channelName/join')
  @UseGuards(FirebaseAuthGuard)
  async joinLive(@Param('channelName') channelName: string) {
    await this.liveService.updateViewerCount(channelName, 1);
    return { message: 'Joined' };
  }

  // POST /api/v1/live/:channelName/leave
  @Post(':channelName/leave')
  @UseGuards(FirebaseAuthGuard)
  async leaveLive(@Param('channelName') channelName: string) {
    await this.liveService.updateViewerCount(channelName, -1);
    return { message: 'Left' };
  }
}