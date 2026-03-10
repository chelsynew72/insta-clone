import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventsGateway } from './events.gateway';
import { GatewayService } from './gateway.service';
import { Message, MessageSchema } from '../messages/schemas/message.schema';
import { Notification, NotificationSchema } from '../notifications/schemas/notification.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema },
      { name: Notification.name, schema: NotificationSchema },
    ]),
  ],
  providers: [EventsGateway, GatewayService],
  exports: [EventsGateway, GatewayService],
})
export class GatewayModule {}