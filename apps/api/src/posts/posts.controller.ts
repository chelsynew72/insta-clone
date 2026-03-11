import {
  Controller, Post, Get, Delete,
  Param, Query, Req, UseGuards,
  UseInterceptors, UploadedFile, Body
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { PostsService } from './posts.service';
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard';

@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  // POST /api/v1/posts
  @Post()
  @UseGuards(FirebaseAuthGuard)
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }))
  async createPost(
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
    @Body('caption') caption: string,
  ) {
    const { uid } = req.user;
    const user = await this.postsService['usersService'].findByUid(uid);
    return this.postsService.createPost(uid, user.username, file, caption);
  }

  // GET /api/v1/posts/feed?page=1
  @Get('feed')
  @UseGuards(FirebaseAuthGuard)
  async getFeed(@Query('page') page: number = 1) {
    return this.postsService.getFeed(page);
  }

  // GET /api/v1/posts/user/:uid
  @Get('user/:uid')
  @UseGuards(FirebaseAuthGuard)
  async getUserPosts(@Param('uid') uid: string) {
    return this.postsService.getUserPosts(uid);
  }

  // GET /api/v1/posts/:id
@Get(':id')
@UseGuards(FirebaseAuthGuard)
async getPost(@Param('id') id: string) {
  return this.postsService.getPostById(id);
}
@Get('explore')
@UseGuards(FirebaseAuthGuard)
async getExplorePosts(@Query('page') page: number = 1) {
  return this.postsService.getExplorePosts(page);
}

  // DELETE /api/v1/posts/:id
  @Delete(':id')
  @UseGuards(FirebaseAuthGuard)
  async deletePost(@Param('id') id: string, @Req() req) {
    await this.postsService.deletePost(id, req.user.uid);
    return { message: 'Post deleted successfully' };
  }
}