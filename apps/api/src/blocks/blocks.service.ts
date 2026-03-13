import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Block, BlockDocument } from './schemas/block.schema';

@Injectable()
export class BlocksService {
  constructor(
    @InjectModel(Block.name) private blockModel: Model<BlockDocument>,
  ) {}

  async blockUser(blockerUid: string, blockedUid: string) {
    if (blockerUid === blockedUid) return { message: 'Cannot block yourself' };
    await this.blockModel.findOneAndUpdate(
      { blockerUid, blockedUid },
      { blockerUid, blockedUid },
      { upsert: true },
    );
    return { message: 'User blocked' };
  }

  async unblockUser(blockerUid: string, blockedUid: string) {
    await this.blockModel.findOneAndDelete({ blockerUid, blockedUid });
    return { message: 'User unblocked' };
  }

  async isBlocked(blockerUid: string, blockedUid: string): Promise<boolean> {
    const block = await this.blockModel.findOne({ blockerUid, blockedUid });
    return !!block;
  }

  async getBlockedUsers(uid: string): Promise<Block[]> {
    return this.blockModel.find({ blockerUid: uid });
  }

  async getBlockedBy(uid: string): Promise<string[]> {
    const blocks = await this.blockModel.find({ blockedUid: uid });
    return blocks.map(b => b.blockerUid);
  }
}