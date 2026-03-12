import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Follow, FollowDocument } from './schemas/follow.schema';
import { UsersService } from '../users/users.service';

@Injectable()
export class FollowsService {
  constructor(
    @InjectModel(Follow.name) private followModel: Model<FollowDocument>,
    private usersService: UsersService,
  ) {}

  async follow(followerId: string, followingId: string) {
    const existing = await this.followModel.findOne({ followerId, followingId });
    if (existing) return { message: 'Already following' };

    await this.followModel.create({ followerId, followingId });

    // update counts on both users
    const followerUser = await this.usersService['userModel'].findOneAndUpdate(
      { uid: followerId },
      { $inc: { followingCount: 1 } },
    );
    await this.usersService['userModel'].findOneAndUpdate(
      { uid: followingId },
      { $inc: { followersCount: 1 } },
    );

    return { message: 'Followed successfully' };
  }

  async unfollow(followerId: string, followingId: string) {
    await this.followModel.findOneAndDelete({ followerId, followingId });

    await this.usersService['userModel'].findOneAndUpdate(
      { uid: followerId },
      { $inc: { followingCount: -1 } },
    );
    await this.usersService['userModel'].findOneAndUpdate(
      { uid: followingId },
      { $inc: { followersCount: -1 } },
    );

    return { message: 'Unfollowed successfully' };
  }

  async getFollowers(uid: string) {
    return this.followModel.find({ followingId: uid });
  }

  async getFollowing(uid: string) {
    return this.followModel.find({ followerId: uid });
  }
  
  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const follow = await this.followModel.findOne({
      followerId: followerId,
      followingId: followingId,
    }).exec();
    return !!follow;
  }
}