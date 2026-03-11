import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  // Called after Firebase login — create user if first time
  async findOrCreate(uid: string, email: string, username: string): Promise<User> {
    const existing = await this.userModel.findOne({ uid });
    if (existing) return existing;

    const usernameExists = await this.userModel.findOne({ username });
    if (usernameExists) throw new ConflictException('Username already taken');

    const newUser = new this.userModel({ uid, email, username });
    return newUser.save();
  }

  async findByUid(uid: string): Promise<User> {
    const user = await this.userModel.findOne({ uid });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
  

  async findByUsername(username: string): Promise<User> {
    const user = await this.userModel.findOne({ username });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
  async getSuggestedUsers(uid: string): Promise<User[]> {
  // Get users that the current user is NOT following
  // For now return random users excluding self
  return this.userModel
    .find({ uid: { $ne: uid } })
    .limit(5)
    .select('uid username avatarUrl followersCount bio');
}

async searchUsers(query: string): Promise<User[]> {
  if (!query || query.trim().length === 0) return [];
  return this.userModel
    .find({
      username: { $regex: query.trim(), $options: 'i' },
    })
    .limit(20)
    .select('uid username avatarUrl followersCount bio');
}

  async updateProfile(uid: string, updates: Partial<User>): Promise<User> {
    const user = await this.userModel.findOneAndUpdate(
      { uid },
      { $set: updates },
      { new: true },
    );
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}