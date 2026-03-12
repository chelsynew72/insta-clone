import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from './schemas/post.schema';
import { Follow, FollowDocument } from '../follows/schemas/follow.schema';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Follow.name) private followModel: Model<FollowDocument>,
    private cloudinaryService: CloudinaryService,
    private usersService: UsersService,
  ) {}

  async createPost(uid: string, username: string, file: Express.Multer.File, caption: string): Promise<Post> {
    const imageUrl = await this.cloudinaryService.uploadImage(file);
    const post = new this.postModel({ uid, username, imageUrl, caption });
    await post.save();
    await this.usersService.updateProfile(uid, { postsCount: await this.postModel.countDocuments({ uid }) });
    return post;
  }

  async getPostById(postId: string): Promise<Post> {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async getFeed(uid: string, page: number = 1, limit: number = 10): Promise<Post[]> {
    // Get UIDs of people this user follows
    const following = await this.followModel.find({ followerId: uid }).select('followingId');
    const followingIds = following.map((f: any) => f.followingId);

    // Include own uid so own posts appear in feed
    const uids = [...followingIds, uid];

    return this.postModel
      .find({ uid: { $in: uids } })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
  }

  async getExplorePosts(page: number = 1, limit: number = 18): Promise<Post[]> {
    return this.postModel
      .find()
      .sort({ likesCount: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
  }

  async getUserPosts(uid: string): Promise<Post[]> {
    return this.postModel.find({ uid }).sort({ createdAt: -1 });
  }

  async deletePost(postId: string, uid: string): Promise<void> {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Post not found');
    if (post.uid !== uid) throw new ForbiddenException('Not your post');
    await this.cloudinaryService.deleteImage(post.imageUrl);
    await post.deleteOne();
  }
}