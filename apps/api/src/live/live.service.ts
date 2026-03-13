import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LiveSession, LiveSessionDocument } from './schemas/live-session.schema';
import { UsersService } from '../users/users.service';

@Injectable()
export class LiveService {
  constructor(
    @InjectModel(LiveSession.name) private liveModel: Model<LiveSessionDocument>,
    private usersService: UsersService,
  ) {}

  async startLive(uid: string, title: string): Promise<LiveSession> {
    // End any existing live session for this user
    await this.liveModel.deleteMany({ hostUid: uid });

    const user = await this.usersService.findByUid(uid);

    return this.liveModel.create({
      hostUid: uid,
      hostUsername: user?.username || '',
      hostAvatarUrl: user?.avatarUrl || '',
      channelName: uid, // use uid as channel name
      status: 'live',
      title,
    });
  }

  async endLive(uid: string): Promise<void> {
    await this.liveModel.findOneAndUpdate(
      { hostUid: uid },
      { status: 'ended' },
    );
    // Clean up after 5 seconds
    setTimeout(() => {
      this.liveModel.deleteMany({ hostUid: uid, status: 'ended' }).exec();
    }, 5000);
  }

  async getActiveLives(): Promise<LiveSession[]> {
    return this.liveModel.find({ status: 'live' }).sort({ viewerCount: -1 });
  }

  async getLiveByChannel(channelName: string): Promise<LiveSession | null> {
    return this.liveModel.findOne({ channelName, status: 'live' });
  }

  async updateViewerCount(channelName: string, delta: number): Promise<void> {
    await this.liveModel.findOneAndUpdate(
      { channelName },
      { $inc: { viewerCount: delta } },
    );
  }
}