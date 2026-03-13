import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Like, LikeDocument } from './schemas/like.schema';
import { PostsService } from '../posts/posts.service';
import { EventsGateway } from '../gateway/events.gateway';
import { GatewayService } from '../gateway/gateway.service';
import { NotificationType } from '../notifications/schemas/notification.schema';

@Injectable()
export class LikesService {
  constructor(
    @InjectModel(Like.name) private likeModel: Model<LikeDocument>,
    private postsService: PostsService,
    private eventsGateway: EventsGateway,
    private gatewayService: GatewayService,
  ) {}

  async likePost(uid: string, username: string, postId: string) {
    const existing = await this.likeModel.findOne({ uid, postId });
    if (existing) return { message: 'Already liked' };

    await this.likeModel.create({ uid, postId });

    const post = await this.postsService['postModel'].findByIdAndUpdate(
      postId,
      { $inc: { likesCount: 1 }, $push: { likes: uid } },
      { new: true },
    );
    if (!post) throw new NotFoundException('Post not found');

    // ← Broadcast to ALL connected clients so other users see the update
    this.eventsGateway.server.emit('postLiked', {
      postId,
      uid,
      likesCount: post.likesCount,
    });

    // Notify post owner
    if (post.uid !== uid) {
      const notification = await this.gatewayService.saveNotification({
        toUid: post.uid,
        fromUid: uid,
        fromUsername: username,
        type: NotificationType.LIKE,
        postId,
      });
      this.eventsGateway.sendNotification(post.uid, notification);
    }

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

    // ← Broadcast unlike too
    this.eventsGateway.server.emit('postLiked', {
      postId,
      uid,
      likesCount: post.likesCount,
    });

    return { message: 'Post unliked', likesCount: post.likesCount };
  }
}