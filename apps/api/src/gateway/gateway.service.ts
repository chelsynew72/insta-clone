import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from '../messages/schemas/message.schema';
import {
  Notification,
  NotificationDocument,
} from '../notifications/schemas/notification.schema';

@Injectable()
export class GatewayService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {}

  // Generate consistent conversation ID from two UIDs
  getConversationId(uid1: string, uid2: string): string {
    return [uid1, uid2].sort().join('_');
  }

  async saveMessage(fromUid: string, toUid: string, text: string) {
    const conversationId = this.getConversationId(fromUid, toUid);
    return this.messageModel.create({ fromUid, toUid, text, conversationId });
  }

  async getMessages(uid1: string, uid2: string) {
    const conversationId = this.getConversationId(uid1, uid2);
    return this.messageModel
      .find({ conversationId })
      .sort({ createdAt: 1 }); // oldest first for chat
  }

  async getConversations(uid: string) {
    // Get latest message from each conversation
    return this.messageModel.aggregate([
      { $match: { $or: [{ fromUid: uid }, { toUid: uid }] } },
      { $sort: { createdAt: -1 } },
      { $group: { _id: '$conversationId', lastMessage: { $first: '$$ROOT' } } },
      { $replaceRoot: { newRoot: '$lastMessage' } },
      { $sort: { createdAt: -1 } },
    ]);
  }

  async markMessagesRead(uid: string, conversationId: string) {
    return this.messageModel.updateMany(
      { conversationId, toUid: uid, read: false },
      { $set: { read: true } },
    );
  }

  async saveNotification(data: Partial<Notification>) {
    return this.notificationModel.create(data);
  }

  async getNotifications(uid: string) {
    return this.notificationModel
      .find({ toUid: uid })
      .sort({ createdAt: -1 })
      .limit(20);
  }

  async markNotificationsRead(uid: string) {
    return this.notificationModel.updateMany(
      { toUid: uid, read: false },
      { $set: { read: true } },
    );
  }
}