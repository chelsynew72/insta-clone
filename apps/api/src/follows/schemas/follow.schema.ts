import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FollowDocument = Follow & Document;

@Schema({ timestamps: true })
export class Follow {
  @Prop({ required: true })
  followerId: string; // who is following

  @Prop({ required: true })
  followingId: string; // who is being followed
}

export const FollowSchema = SchemaFactory.createForClass(Follow);