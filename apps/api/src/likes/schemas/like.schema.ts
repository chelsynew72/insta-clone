import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LikeDocument = Like & Document;

@Schema({ timestamps: true })
export class Like {
  @Prop({ required: true })
  uid: string; // who liked

  @Prop({ required: true })
  postId: string; // which post
}

export const LikeSchema = SchemaFactory.createForClass(Like);