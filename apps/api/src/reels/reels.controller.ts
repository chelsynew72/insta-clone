import { Controller, Post, Get, Delete, Param, Query, Req, UseGuards, UseInterceptors, UploadedFile, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ReelsService } from './reels.service';
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard';

@Controller('reels')
export class ReelsController {
  constructor(private reelsService: ReelsService) {}

  @Post()
  @UseGuards(FirebaseAuthGuard)
  @UseInterceptors(FileInterceptor('video', { storage: memoryStorage() }))
  async createReel(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body('caption') caption: string = '',
    @Body('audio') audio: string = '',
  ) {
    return this.reelsService.createReel(req.user.uid, file, caption, audio);
  }

  @Get()
  @UseGuards(FirebaseAuthGuard)
  async getFeedReels(@Query('page') page: number = 1) {
    return this.reelsService.getFeedReels(page);
  }

  @Post(':id/like')
  @UseGuards(FirebaseAuthGuard)
  async likeReel(@Param('id') id: string, @Req() req: any) {
    await this.reelsService.likeReel(id, req.user.uid);
    return { message: 'Liked' };
  }

  @Delete(':id/like')
  @UseGuards(FirebaseAuthGuard)
  async unlikeReel(@Param('id') id: string, @Req() req: any) {
    await this.reelsService.unlikeReel(id, req.user.uid);
    return { message: 'Unliked' };
  }

  @Post(':id/save')
  @UseGuards(FirebaseAuthGuard)
  async saveReel(@Param('id') id: string, @Req() req: any) {
    await this.reelsService.saveReel(id, req.user.uid);
    return { message: 'Saved' };
  }

  @Delete(':id/save')
  @UseGuards(FirebaseAuthGuard)
  async unsaveReel(@Param('id') id: string, @Req() req: any) {
    await this.reelsService.unsaveReel(id, req.user.uid);
    return { message: 'Unsaved' };
  }

  @Delete(':id')
  @UseGuards(FirebaseAuthGuard)
  async deleteReel(@Param('id') id: string, @Req() req: any) {
    await this.reelsService.deleteReel(id, req.user.uid);
    return { message: 'Deleted' };
  }
}