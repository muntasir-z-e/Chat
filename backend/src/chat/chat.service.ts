import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async createOneToOneChat(userId: string, otherUserId: string) {
    const existingChat = await this.prisma.chat.findFirst({
      where: {
        isGroup: false,
        users: {
          every: {
            id: { in: [userId, otherUserId] },
          },
        },
      },
      include: {
        users: true,
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (existingChat) return existingChat;

    const newChat = await this.prisma.chat.create({
      data: {
        isGroup: false,
        users: {
          connect: [{ id: userId }, { id: otherUserId }],
        },
      },
      include: {
        users: true,
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return newChat;
  }

  async getUserChats(userId: string) {
    return this.prisma.chat.findMany({
      where: {
        users: {
          some: { id: userId },
        },
      },
      include: {
        users: true,
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async createGroupChat(creatorId: string, name: string, userIds: string[]) {
    const uniqueUserIds = Array.from(new Set([...userIds, creatorId])); // include creator

    const users = await this.prisma.user.findMany({
      where: { id: { in: uniqueUserIds } },
    });

    if (users.length < 3) {
      throw new Error('Group chat requires at least 3 users');
    }

    return this.prisma.chat.create({
      data: {
        name,
        isGroup: true,
        users: {
          connect: uniqueUserIds.map((id) => ({ id })),
        },
      },
      include: {
        users: true,
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async renameGroupChat(chatId: string, newName: string) {
    return this.prisma.chat.update({
      where: { id: chatId },
      data: { name: newName },
    });
  }

  async addUserToGroup(chatId: string, userId: string) {
    return this.prisma.chat.update({
      where: { id: chatId },
      data: {
        users: { connect: { id: userId } },
      },
    });
  }

  async removeUserFromGroup(chatId: string, userId: string) {
    return this.prisma.chat.update({
      where: { id: chatId },
      data: {
        users: { disconnect: { id: userId } },
      },
    });
  }

  async deleteChat(chatId: string) {
    return this.prisma.chat.delete({
      where: { id: chatId },
    });
  }
}
