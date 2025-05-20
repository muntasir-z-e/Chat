import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessageService {
  constructor(private prisma: PrismaService) {}

  async createMessage(userId: string, chatId: string, content: string) {
    const chat = await this.prisma.chat.findUnique({ where: { id: chatId } });
    if (!chat) throw new NotFoundException('Chat not found');

    const message = await this.prisma.message.create({
      data: {
        content,
        senderId: userId,
        chatId,
      },
      include: {
        sender: true,
        chat: true,
      },
    });

    await this.prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });

    return message;
  }

  async getChatMessages(chatId: string, take = 20, skip = 0) {
    return this.prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'desc' },
      take,
      skip,
      include: {
        sender: true,
      },
    });
  }
}
