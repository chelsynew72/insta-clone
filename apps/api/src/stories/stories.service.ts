import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Story, StoryDocument } from './schemas/story.schema';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class StoriesService {
  constructor(
    @InjectModel(Story.name) private storyModel: Model<StoryDocument>,
    private cloudinaryService: CloudinaryService,
  ) {}

  async createStory(
    uid: string,
    username: string,
    avatarUrl: string,
    file: Express.Multer.File,
    caption: string,
  ): Promise<Story> {
    const imageUrl = await this.cloudinaryService.uploadImage(file);

    // expiresAt = now + 24 hours
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    return this.storyModel.create({
      uid, username, avatarUrl, imageUrl, caption, expiresAt,
    });
  }

  async getStoriesForUser(uid: string, followingIds: string[]): Promise<any[]> {
    // Get stories from followed users + own stories
    const uids = [...followingIds, uid];
    const now = new Date();

    const stories = await this.storyModel.find({
      uid: { $in: uids },
      expiresAt: { $gt: now }, // only non-expired
    }).sort({ createdAt: -1 });

    // Group by user
    const grouped = stories.reduce((acc: any, story: any) => {
      if (!acc[story.uid]) {
        acc[story.uid] = {
          uid: story.uid,
          username: story.username,
          avatarUrl: story.avatarUrl,
          stories: [],
          hasUnviewed: false,
        };
      }
      acc[story.uid].stories.push(story);
      if (!story.views.includes(uid)) {
        acc[story.uid].hasUnviewed = true;
      }
      return acc;
    }, {});

    return Object.values(grouped);
  }

  async viewStory(storyId: string, viewerUid: string): Promise<void> {
    await this.storyModel.findByIdAndUpdate(storyId, {
      $addToSet: { views: viewerUid },
    });
  }

  async getMyStories(uid: string): Promise<Story[]> {
    return this.storyModel
      .find({ uid, expiresAt: { $gt: new Date() } })
      .sort({ createdAt: -1 });
  }

  async deleteStory(storyId: string, uid: string): Promise<void> {
    await this.storyModel.findOneAndDelete({ _id: storyId, uid });
  }
}