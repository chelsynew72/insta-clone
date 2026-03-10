import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PostDocument = Post & Document;

@Schema({ timestamps: true })
export class Post {
  @Prop({ required: true })
  uid: string; // Firebase UID of the author

  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  imageUrl: string;

  @Prop({ default: '' })
  caption: string;

  @Prop({ default: [] })
  likes: string[]; // array of UIDs who liked

  @Prop({ default: 0 })
  likesCount: number;

  @Prop({ default: 0 })
  commentsCount: number;
}

export const PostSchema = SchemaFactory.createForClass(Post);