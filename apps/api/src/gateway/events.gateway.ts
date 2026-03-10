import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GatewayService } from './gateway.service';
import { FirebaseService } from '../firebase/firebase.service';

@WebSocketGateway({
  cors: { origin: 'http://localhost:3001', credentials: true },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Map of uid → socketId for sending to specific users
  private connectedUsers = new Map<string, string>();

  constructor(
    private gatewayService: GatewayService,
    private firebaseService: FirebaseService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      // Verify Firebase token on connect
      const token = client.handshake.auth?.token;
      if (!token) return client.disconnect();

      const decoded = await this.firebaseService.getAuth().verifyIdToken(token);
      client.data.uid = decoded.uid;

      // Register user as online
      this.connectedUsers.set(decoded.uid, client.id);
      console.log(`User connected: ${decoded.uid}`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    if (client.data.uid) {
      this.connectedUsers.delete(client.data.uid);
      console.log(`User disconnected: ${client.data.uid}`);
    }
  }

  // Send notification to a specific user if they're online
  sendNotification(toUid: string, notification: any) {
    const socketId = this.connectedUsers.get(toUid);
    if (socketId) {
      this.server.to(socketId).emit('notification', notification);
    }
  }

  // Send message to a specific user if they're online
  sendMessage(toUid: string, message: any) {
    const socketId = this.connectedUsers.get(toUid);
    if (socketId) {
      this.server.to(socketId).emit('message', message);
    }
  }

  // Client sends a chat message
  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { toUid: string; text: string },
  ) {
    const fromUid = client.data.uid;
    const message = await this.gatewayService.saveMessage(
      fromUid,
      data.toUid,
      data.text,
    );

    // Send to recipient if online
    this.sendMessage(data.toUid, message);

    // Send back to sender to confirm
    client.emit('messageSent', message);
  }

  // Client marks messages as read
  @SubscribeMessage('markRead')
  async handleMarkRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    await this.gatewayService.markMessagesRead(
      client.data.uid,
      data.conversationId,
    );
    client.emit('markedRead', { conversationId: data.conversationId });
  }
}