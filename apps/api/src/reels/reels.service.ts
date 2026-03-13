import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Reel, ReelDocument } from './schemas/reel.schema';
import { UsersService } from '../users/users.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class ReelsService {
  constructor(
    @InjectModel(Reel.name) private reelModel: Model<ReelDocument>,
    private usersService: UsersService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async createReel(uid: string, file: Express.Multer.File, caption: string, audio: string): Promise<Reel> {
    const user = await this.usersService.findByUid(uid);
    if (!user) throw new NotFoundException('User not found');

    // Upload video to Cloudinary as video resource
    const videoUrl = await this.cloudinaryService.uploadVideo(file);

    return this.reelModel.create({
      uid,
      username: user.username,
      avatarUrl: user.avatarUrl || '',
      videoUrl,
      caption,
      audio: audio || 'Original audio',
    });
  }

  async getFeedReels(page: number = 1, limit: number = 10): Promise<Reel[]> {
    return this.reelModel
      .find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
  }

  async likeReel(reelId: string, uid: string): Promise<void> {
    await this.reelModel.findByIdAndUpdate(reelId, {
      $addToSet: { likes: uid },
      $inc: { likesCount: 1 },
    });
  }

  async unlikeReel(reelId: string, uid: string): Promise<void> {
    await this.reelModel.findByIdAndUpdate(reelId, {
      $pull: { likes: uid },
      $inc: { likesCount: -1 },
    });
  }

  async saveReel(reelId: string, uid: string): Promise<void> {
    await this.reelModel.findByIdAndUpdate(reelId, {
      $addToSet: { savedBy: uid },
    });
  }

  async unsaveReel(reelId: string, uid: string): Promise<void> {
    await this.reelModel.findByIdAndUpdate(reelId, {
      $pull: { savedBy: uid },
    });
  }

  async deleteReel(reelId: string, uid: string): Promise<void> {
    const reel = await this.reelModel.findById(reelId);
    if (!reel) throw new NotFoundException('Reel not found');
    if (reel.uid !== uid) throw new ForbiddenException('Not your reel');
    await reel.deleteOne();
  }
}