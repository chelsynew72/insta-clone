import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LiveSessionDocument = LiveSession & Document;

@Schema({ timestamps: true })
export class LiveSession {
  @Prop({ required: true })
  hostUid: string;

  @Prop({ required: true })
  hostUsername: string;

  @Prop({ default: '' })
  hostAvatarUrl: string;

  @Prop({ required: true, unique: true })
  channelName: string; // Agora channel = hostUid

  @Prop({ default: 'live' })
  status: string; // 'live' | 'ended'

  @Prop({ default: 0 })
  viewerCount: number;

  @Prop({ default: '' })
  title: string;
}

export const LiveSessionSchema = SchemaFactory.createForClass(LiveSession);