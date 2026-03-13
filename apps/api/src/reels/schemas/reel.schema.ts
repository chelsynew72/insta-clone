import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReelDocument = Reel & Document;

@Schema({ timestamps: true })
export class Reel {
  @Prop({ required: true }) uid: string;
  @Prop({ required: true }) username: string;
  @Prop({ default: '' }) avatarUrl: string;
  @Prop({ required: true }) videoUrl: string;
  @Prop({ default: '' }) thumbnailUrl: string;
  @Prop({ default: '' }) caption: string;
  @Prop({ default: '' }) audio: string;
  @Prop({ type: [String], default: [] }) likes: string[];
  @Prop({ default: 0 }) likesCount: number;
  @Prop({ default: 0 }) commentsCount: number;
  @Prop({ default: 0 }) sharesCount: number;
  @Prop({ type: [String], default: [] }) savedBy: string[];
}

export const ReelSchema = SchemaFactory.createForClass(Reel);