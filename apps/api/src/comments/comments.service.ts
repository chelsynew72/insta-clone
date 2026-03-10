import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from './schemas/comment.schema';
import { PostsService } from '../posts/posts.service';
import { UsersService } from '../users/users.service';
import { EventsGateway } from '../gateway/events.gateway';
import { GatewayService } from '../gateway/gateway.service';
import { NotificationType } from '../notifications/schemas/notification.schema';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    private postsService: PostsService,
    private usersService: UsersService,
    private eventsGateway: EventsGateway,
    private gatewayService: GatewayService,
  ) {}

  async addComment(uid: string, postId: string, text: string) {
    // Get commenter's profile
    const user = await this.usersService.findByUid(uid);

    // Save comment to MongoDB
    const comment = await this.commentModel.create({
      uid,
      username: user.username,
      postId,
      text,
    });

    // Increment comments count on post
    const post = await this.postsService['postModel'].findByIdAndUpdate(
      postId,
      { $inc: { commentsCount: 1 } },
      { new: true },
    );

    // Broadcast new comment to ALL connected clients in real-time
    this.eventsGateway.server.emit('newComment', comment);

    // Send notification to post owner (if not commenting on own post)
    if (post && post.uid !== uid) {
      const notification = await this.gatewayService.saveNotification({
        toUid: post.uid,
        fromUid: uid,
        fromUsername: user.username,
        type: NotificationType.COMMENT,
        postId,
        text: text.slice(0, 50), // preview
      });

      // Send real-time notification to post owner if online
      this.eventsGateway.sendNotification(post.uid, notification);
    }

    return comment;
  }

  async getComments(postId: string) {
    return this.commentModel
      .find({ postId })
      .sort({ createdAt: -1 });
  }

  async deleteComment(commentId: string, uid: string) {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.uid !== uid) throw new ForbiddenException('Not your comment');

    await comment.deleteOne();

    // Decrement comments count on post
    await this.postsService['postModel'].findByIdAndUpdate(comment.postId, {
      $inc: { commentsCount: -1 },
    });

    // Broadcast deletion to all clients
    this.eventsGateway.server.emit('deleteComment', {
      commentId,
      postId: comment.postId,
    });

    return { message: 'Comment deleted' };
  }
}