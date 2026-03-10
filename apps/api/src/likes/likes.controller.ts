import { Controller, Post, Delete, Param, Req, UseGuards } from '@nestjs/common';
import { LikesService } from './likes.service';
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard';

@Controller('likes')
export class LikesController {
  constructor(private likesService: LikesService) {}

  @Post(':postId')
  @UseGuards(FirebaseAuthGuard)
  async likePost(@Param('postId') postId: string, @Req() req) {
    return this.likesService.likePost(req.user.uid, req.user.name ?? 'user', postId);
  }

  @Delete(':postId')
  @UseGuards(FirebaseAuthGuard)
  async unlikePost(@Param('postId') postId: string, @Req() req) {
    return this.likesService.unlikePost(req.user.uid, postId);
  }
}