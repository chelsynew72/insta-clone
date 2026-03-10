import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from './schemas/comment.schema';
import { PostsService } from '../posts/posts.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    private postsService: PostsService,
    private usersService: UsersService,
  ) {}

  async addComment(uid: string, postId: string, text: string) {
    const user = await this.usersService.findByUid(uid);
    const comment = await this.commentModel.create({
      uid,
      username: user.username,
      postId,
      text,
    });

    // increment comments count on post
    await this.postsService['postModel'].findByIdAndUpdate(postId, {
      $inc: { commentsCount: 1 },
    });

    return comment;
  }

  async getComments(postId: string) {
    return this.commentModel.find({ postId }).sort({ createdAt: -1 });
  }

  async deleteComment(commentId: string, uid: string) {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.uid !== uid) throw new ForbiddenException('Not your comment');

    await comment.deleteOne();
    await this.postsService['postModel'].findByIdAndUpdate(comment.postId, {
      $inc: { commentsCount: -1 },
    });
    return { message: 'Comment deleted' };
  }
}