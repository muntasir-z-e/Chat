import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Chats')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chats')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get()
  @ApiOperation({ summary: 'Get all chats for the current user' })
  @ApiResponse({
    status: 200,
    description: 'List of user chats retrieved successfully',
  })
  getUserChats(@CurrentUser() user) {
    return this.chatService.getUserChats(user.id);
  }

  @Post('one-to-one')
  @ApiOperation({ summary: 'Create one-to-one chat' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        otherUserId: { type: 'string' },
      },
      required: ['otherUserId'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'One-to-one chat created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Missing user IDs or invalid input',
  })
  createOneToOneChat(
    @CurrentUser() user,
    @Body() body: { otherUserId: string },
  ) {
    return this.chatService.createOneToOneChat(user.id, body.otherUserId);
  }

  @Post('group')
  @ApiOperation({ summary: 'Create a group chat' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        creatorId: { type: 'string' },
        name: { type: 'string' },
        userIds: {
          type: 'array',
          items: { type: 'string' },
        },
      },
      required: ['creatorId', 'name', 'userIds'],
    },
  })
  @ApiResponse({ status: 201, description: 'Group chat created successfully' })
  createGroupChat(
    @Body() body: { creatorId: string; name: string; userIds: string[] },
  ) {
    return this.chatService.createGroupChat(
      body.creatorId,
      body.name,
      body.userIds,
    );
  }

  @Patch(':chatId/rename')
  @ApiOperation({ summary: 'Rename a group chat' })
  @ApiParam({ name: 'chatId', type: 'string' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
      },
      required: ['name'],
    },
  })
  @ApiResponse({ status: 200, description: 'Group chat renamed successfully' })
  renameGroupChat(
    @Param('chatId') chatId: string,
    @Body() body: { name: string },
  ) {
    return this.chatService.renameGroupChat(chatId, body.name);
  }

  @Patch(':chatId/add-user')
  @ApiOperation({ summary: 'Add user to group chat' })
  @ApiParam({ name: 'chatId', type: 'string' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string' },
      },
      required: ['userId'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'User added to group chat successfully',
  })
  addUserToGroup(
    @Param('chatId') chatId: string,
    @Body() body: { userId: string },
  ) {
    return this.chatService.addUserToGroup(chatId, body.userId);
  }

  @Patch(':chatId/remove-user')
  @ApiOperation({ summary: 'Remove user from group chat' })
  @ApiParam({ name: 'chatId', type: 'string' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string' },
      },
      required: ['userId'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'User removed from group chat successfully',
  })
  removeUserFromGroup(
    @Param('chatId') chatId: string,
    @Body() body: { userId: string },
  ) {
    return this.chatService.removeUserFromGroup(chatId, body.userId);
  }

  @Delete(':chatId')
  @ApiOperation({ summary: 'Delete a chat' })
  @ApiParam({ name: 'chatId', type: 'string' })
  @ApiResponse({ status: 200, description: 'Chat deleted successfully' })
  deleteChat(@Param('chatId') chatId: string) {
    return this.chatService.deleteChat(chatId);
  }
}
