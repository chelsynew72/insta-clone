import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StoryDocument = Story & Document;

@Schema({ timestamps: true })
export class Story {
  @Prop({ required: true })
  uid: string;

  @Prop({ required: true })
  username: string;
@Prop({ default: '' })  
avatarUrl: string;

  @Prop({ required: true })
  imageUrl: string;

  @Prop({ default: '' })
  caption: string;

  // Array of UIDs who viewed this story
  @Prop({ default: [] })
  views: string[];

  // Auto-expire after 24 hours using MongoDB TTL index
  @Prop({ default: () => new Date() })
  expiresAt: Date;
}

export const StorySchema = SchemaFactory.createForClass(Story);

// TTL index — MongoDB auto-deletes documents 86400 seconds (24hrs) after expiresAt
StorySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 86400 });