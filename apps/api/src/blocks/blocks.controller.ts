import { Controller, Post, Delete, Get, Param, Req, UseGuards } from '@nestjs/common';
import { BlocksService } from './blocks.service';
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard';

@Controller('blocks')
export class BlocksController {
  constructor(private blocksService: BlocksService) {}

  // POST /api/v1/blocks/:uid
  @Post(':uid')
  @UseGuards(FirebaseAuthGuard)
  async blockUser(@Param('uid') uid: string, @Req() req: any) {
    return this.blocksService.blockUser(req.user.uid, uid);
  }

  // DELETE /api/v1/blocks/:uid
  @Delete(':uid')
  @UseGuards(FirebaseAuthGuard)
  async unblockUser(@Param('uid') uid: string, @Req() req: any) {
    return this.blocksService.unblockUser(req.user.uid, uid);
  }

  // GET /api/v1/blocks
  @Get()
  @UseGuards(FirebaseAuthGuard)
  async getBlockedUsers(@Req() req: any) {
    return this.blocksService.getBlockedUsers(req.user.uid);
  }
}