import {
  Controller, Post, Get, Delete, Param,
  Req, UseGuards, UseInterceptors, UploadedFile, Body
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { StoriesService } from './stories.service';
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard';
import { FollowsService } from '../follows/follows.service';
import { UsersService } from '../users/users.service';

@Controller('stories')
export class StoriesController {
  constructor(
    private storiesService: StoriesService,
    private followsService: FollowsService,
    private usersService: UsersService,
  ) {}

  @Post()
  @UseGuards(FirebaseAuthGuard)
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }))
  async createStory(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body('caption') caption: string = '',
  ) {
    const { uid } = req.user;
    // Fetch real user data from DB — don't trust form body
    const user = await this.usersService.findByUid(uid);
    return this.storiesService.createStory(
      uid,
      user?.username || '',
      user?.avatarUrl || '',
      file,
      caption,
    );
  }

  @Get('feed')
  @UseGuards(FirebaseAuthGuard)
  async getStoriesFeed(@Req() req: any) {
    const { uid } = req.user;
    const following = await this.followsService.getFollowing(uid);
    const followingIds = following.map((f: any) => f.followingId);
    return this.storiesService.getStoriesForUser(uid, followingIds);
  }

  @Get('mine')
  @UseGuards(FirebaseAuthGuard)
  async getMyStories(@Req() req: any) {
    return this.storiesService.getMyStories(req.user.uid);
  }

  @Post(':id/view')
  @UseGuards(FirebaseAuthGuard)
  async viewStory(@Param('id') id: string, @Req() req: any) {
    await this.storiesService.viewStory(id, req.user.uid);
    return { message: 'Viewed' };
  }

  @Delete(':id')
  @UseGuards(FirebaseAuthGuard)
  async deleteStory(@Param('id') id: string, @Req() req: any) {
    await this.storiesService.deleteStory(id, req.user.uid);
    return { message: 'Story deleted' };
  }
}