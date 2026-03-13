import { Controller, Post, Delete, Get, Param, Req, UseGuards } from '@nestjs/common';
import { FollowsService } from './follows.service';
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard';

@Controller('follows')
export class FollowsController {
  constructor(private followsService: FollowsService) {}
  
  // GET /api/v1/follows/:uid/is-following
  @Get(':uid/is-following')
  @UseGuards(FirebaseAuthGuard)
  async checkIsFollowing(@Param('uid') uid: string, @Req() req: any) {
    const isFollowing = await this.followsService.isFollowing(req.user.uid, uid);
    return { isFollowing: !!isFollowing };
  }

  // POST /api/v1/follows/:uid
  @Post(':uid')
  @UseGuards(FirebaseAuthGuard)
  async follow(@Param('uid') uid: string, @Req() req) {
    return this.followsService.follow(req.user.uid, uid);
  }

  // DELETE /api/v1/follows/:uid
  @Delete(':uid')
  @UseGuards(FirebaseAuthGuard)
  async unfollow(@Param('uid') uid: string, @Req() req) {
    return this.followsService.unfollow(req.user.uid, uid);
  }

  // GET /api/v1/follows/:uid/followers
  @Get(':uid/followers')
  @UseGuards(FirebaseAuthGuard)
  async getFollowers(@Param('uid') uid: string) {
    return this.followsService.getFollowers(uid);
  }

  // GET /api/v1/follows/:uid/following
  @Get(':uid/following')
  @UseGuards(FirebaseAuthGuard)
  async getFollowing(@Param('uid') uid: string) {
    return this.followsService.getFollowing(uid);
  }

}