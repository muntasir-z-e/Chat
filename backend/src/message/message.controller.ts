import { Controller, Post, Get, Param, Body, Query } from '@nestjs/common';
import { MessageService } from './message.service';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Messages')
@ApiBearerAuth()
@Controller('messages')
export class MessageController {
  constructor(private messageService: MessageService) {}

  @Post()
  @ApiOperation({ summary: 'Send a message' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string' },
        chatId: { type: 'string' },
        content: { type: 'string' },
      },
      required: ['userId', 'chatId', 'content'],
    },
  })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  @ApiResponse({ status: 400, description: 'Missing or invalid message data' })
  sendMessage(
    @Body() body: { userId: string; chatId: string; content: string },
  ) {
    return this.messageService.createMessage(
      body.userId,
      body.chatId,
      body.content,
    );
  }

  @Get(':chatId')
  @ApiOperation({ summary: 'Get messages from a chat with pagination' })
  @ApiParam({ name: 'chatId', type: 'string' })
  @ApiQuery({ name: 'take', required: false, type: 'number', example: 20 })
  @ApiQuery({ name: 'skip', required: false, type: 'number', example: 0 })
  @ApiResponse({ status: 200, description: 'Messages retrieved successfully' })
  @ApiResponse({
    status: 404,
    description: 'Chat not found or no messages available',
  })
  getMessages(
    @Param('chatId') chatId: string,
    @Query('take') take: string,
    @Query('skip') skip: string,
  ) {
    return this.messageService.getChatMessages(
      chatId,
      Number(take) || 20,
      Number(skip) || 0,
    );
  }
}
