import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Like, LikeDocument } from './schemas/like.schema';
import { PostsService } from '../posts/posts.service';

@Injectable()
export class LikesService {
  constructor(
    @InjectModel(Like.name) private likeModel: Model<LikeDocument>,
    private postsService: PostsService,
  ) {}

  async likePost(uid: string, postId: string) {
    const existing = await this.likeModel.findOne({ uid, postId });
    if (existing) return { message: 'Already liked' };

    await this.likeModel.create({ uid, postId });

    // increment post likes count
    const post = await this.postsService['postModel'].findByIdAndUpdate(
      postId,
      { $inc: { likesCount: 1 }, $push: { likes: uid } },
      { new: true },
    );
    if (!post) throw new NotFoundException('Post not found');
    return { message: 'Post liked', likesCount: post.likesCount };
  }

  async unlikePost(uid: string, postId: string) {
    await this.likeModel.findOneAndDelete({ uid, postId });

    const post = await this.postsService['postModel'].findByIdAndUpdate(
      postId,
      { $inc: { likesCount: -1 }, $pull: { likes: uid } },
      { new: true },
    );
    if (!post) throw new NotFoundException('Post not found');
    return { message: 'Post unliked', likesCount: post.likesCount };
  }
}