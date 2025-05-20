import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageService } from '../message/message.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private messageService: MessageService) {}

  handleConnection(socket: Socket) {}

  handleDisconnect(socket: Socket) {}

  @SubscribeMessage('joinChat')
  async handleJoinChat(
    @MessageBody() chatId: string,
    @ConnectedSocket() socket: Socket,
  ) {
    socket.join(chatId);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() data: { chatId: string; content: string; senderId: string },
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      const message = await this.messageService.createMessage(
        data.senderId,
        data.chatId,
        data.content,
      );
      this.server.to(data.chatId).emit('newMessage', message);
    } catch (error) {
      console.error('[Gateway] Error in handleSendMessage:', error);
      if (error instanceof Error) {
        console.error(error.stack);
      }
      socket.emit('exception', {
        message: error?.message || 'Failed to send message',
        error: error,
        stack: error?.stack,
      });
    }
  }
}
