import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NotificationDocument = Notification & Document;

export enum NotificationType {
  LIKE = 'like',
  COMMENT = 'comment',
  FOLLOW = 'follow',
  MESSAGE = 'message',
}

@Schema({ timestamps: true })
export class Notification {
  @Prop({ required: true })
  toUid: string; // who receives it

  @Prop({ required: true })
  fromUid: string; // who triggered it

  @Prop({ required: true })
  fromUsername: string;

  @Prop({ required: true, enum: NotificationType })
  type: NotificationType;

  @Prop({ default: '' })
  postId: string; // for like/comment notifications

  @Prop({ default: '' })
  text: string; // comment text preview

  @Prop({ default: false })
  read: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);