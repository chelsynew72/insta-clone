import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema({ timestamps: true })
export class Message {
  @Prop({ required: true })
  fromUid: string;

  @Prop({ required: true })
  toUid: string;

  @Prop({ required: true })
  text: string;

  @Prop({ default: false })
  read: boolean;

  @Prop({ required: true })
  conversationId: string; // uid1_uid2 sorted alphabetically
}

export const MessageSchema = SchemaFactory.createForClass(Message);