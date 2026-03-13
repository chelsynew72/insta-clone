import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BlockDocument = Block & Document;

@Schema({ timestamps: true })
export class Block {
  @Prop({ required: true })
  blockerUid: string; // who blocked

  @Prop({ required: true })
  blockedUid: string; // who got blocked
}

export const BlockSchema = SchemaFactory.createForClass(Block);

// Ensure a user can only block another user once
BlockSchema.index({ blockerUid: 1, blockedUid: 1 }, { unique: true });