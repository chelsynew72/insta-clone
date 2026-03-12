import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Follow, FollowDocument } from '../follows/schemas/follow.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Follow.name) private followModel: Model<FollowDocument>,
  ) {}

  async findOrCreate(uid: string, email: string, username: string): Promise<User> {
    let user = await this.userModel.findOne({ uid });
    if (!user) {
      user = await this.userModel.create({ uid, email, username });
    }
    return user;
  }

  async findByUid(uid: string): Promise<User | null> {
    return this.userModel.findOne({ uid });
  }

  async updateProfile(uid: string, data: Partial<User>): Promise<User | null> {
    return this.userModel.findOneAndUpdate({ uid }, data, { new: true });
  }

  async getSuggestedUsers(uid: string): Promise<User[]> {
    const following = await this.followModel.find({ followerId: uid }).select('followingId');
    const followingIds = following.map((f: any) => f.followingId);

    return this.userModel
      .find({ uid: { $nin: [...followingIds, uid] } })
      .limit(5)
      .select('uid username avatarUrl followersCount bio');
  }

  async searchUsers(query: string): Promise<User[]> {
    if (!query || query.trim().length === 0) return [];
    return this.userModel
      .find({ username: { $regex: query.trim(), $options: 'i' } })
      .limit(20)
      .select('uid username avatarUrl followersCount bio');
  }
}
