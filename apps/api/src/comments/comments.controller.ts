import { Controller, Post, Get, Delete, Param, Body, Req, UseGuards } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard';

@Controller('comments')
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  // POST /api/v1/comments/:postId
  @Post(':postId')
  @UseGuards(FirebaseAuthGuard)
  async addComment(
    @Param('postId') postId: string,
    @Body('text') text: string,
    @Req() req,
  ) {
    return this.commentsService.addComment(req.user.uid, postId, text);
  }

  // GET /api/v1/comments/:postId
  @Get(':postId')
  @UseGuards(FirebaseAuthGuard)
  async getComments(@Param('postId') postId: string) {
    return this.commentsService.getComments(postId);
  }

  // DELETE /api/v1/comments/:commentId
  @Delete(':commentId')
  @UseGuards(FirebaseAuthGuard)
  async deleteComment(@Param('commentId') commentId: string, @Req() req) {
    return this.commentsService.deleteComment(commentId, req.user.uid);
  }
}