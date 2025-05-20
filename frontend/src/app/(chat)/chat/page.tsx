"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Divider,
  Button,
  useMediaQuery,
  useTheme,
  Alert,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
} from "@mui/material";
import {
  Menu as MenuIcon,
  AccountCircle,
  Add as AddIcon,
  ExitToApp as LogoutIcon,
} from "@mui/icons-material";
import { useAuth } from "@/hooks/useAuth";
import { useSocket } from "@/hooks/useSocket";
import { chatApi, messageApi } from "@/lib/api";
import { Chat, Message } from "@/types";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMessage";
import MessageList from "@/components/MessageList";
import MessageInput from "@/components/MessageInput";
import CreateChatModal from "@/components/CreateChatModal";
import { formatChatDate, getRelativeTime } from "@/utils/dateFormat";

export default function ChatPage() {
  const { user, logout } = useAuth();
  const {
    isConnected,
    error: socketError,
    joinChat,
    sendMessage: sendSocketMessage,
    subscribeToMessages,
  } = useSocket();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messageError, setMessageError] = useState<string | null>(null);
  const [isCreateChatModalOpen, setIsCreateChatModalOpen] = useState(false);

  const [messageCount, setMessageCount] = useState(20);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const fetchedChats = await chatApi.getChats().json<Chat[]>();
      setChats(fetchedChats);
      if (fetchedChats.length > 0 && !selectedChat) {
        setSelectedChat(fetchedChats[0]);
      }
    } catch (err) {
      console.error("Failed to fetch chats:", err);
      setError("Failed to load chats. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedChat) {
      setMessageCount(20);
      setHasMoreMessages(true);

      fetchMessages(selectedChat.id);

      joinChat(selectedChat.id);
    }
  }, [selectedChat?.id, joinChat]);

  useEffect(() => {
    if (selectedChat) {
      const unsubscribe = subscribeToMessages((newMessage) => {
        if (newMessage.chatId === selectedChat.id) {
          setMessages((prev) => {
            const messageExists = prev.some((msg) => msg.id === newMessage.id);
            if (messageExists) return prev;
            return [...prev, newMessage];
          });
        }
        setChats((prevChats) => {
          const chatIndex = prevChats.findIndex(
            (chat) => chat.id === newMessage.chatId
          );
          if (chatIndex === -1) return prevChats;
          const updatedChat = {
            ...prevChats[chatIndex],
            messages: prevChats[chatIndex].messages
              ? [
                  ...prevChats[chatIndex].messages.filter(
                    (msg) => msg.id !== newMessage.id
                  ),
                  newMessage,
                ]
              : [newMessage],
            updatedAt: new Date().toISOString(),
          };
          const newChats = [
            updatedChat,
            ...prevChats.slice(0, chatIndex),
            ...prevChats.slice(chatIndex + 1),
          ];
          return newChats;
        });
      });

      return () => {
        unsubscribe();
      };
    }
  }, [selectedChat, subscribeToMessages]);

  const fetchMessages = async (chatId: string, take = 20, skip = 0) => {
    setIsLoadingMessages(true);
    setMessageError(null);
    try {
      const fetchedMessages = await messageApi
        .getMessages(chatId, take, skip)
        .json<Message[]>();

      if (fetchedMessages.length < take) {
        setHasMoreMessages(false);
      }

      if (skip > 0) {
        setMessages((prev) => {
          const allMessages = [...fetchedMessages, ...prev];
          const uniqueMessages = allMessages.filter(
            (msg, idx, arr) => arr.findIndex((m) => m.id === msg.id) === idx
          );
          return uniqueMessages;
        });
      } else {
        setMessages(fetchedMessages);
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err);
      setMessageError("Failed to load messages. Please try again later.");
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const loadMoreMessages = () => {
    if (!selectedChat || !hasMoreMessages || isLoadingMessages) return;

    const skip = messageCount;
    const take = 20;

    fetchMessages(selectedChat.id, take, skip);
    setMessageCount((prev) => prev + take);
  };

  const sendMessage = async (content: string) => {
    if (!selectedChat || !user) return;

    try {
      await messageApi.sendMessage(selectedChat.id, content).json<Message>();

      if (isConnected) {
        sendSocketMessage(selectedChat.id, content, user.id);
      }
      setChats((prevChats) => {
        return prevChats.map((chat) => {
          if (chat.id === selectedChat.id) {
            return {
              ...chat,
              messages: chat.messages || [],
            };
          }
          return chat;
        });
      });
    } catch (err) {
      console.error("Failed to send message:", err);
      throw err;
    }
  };

  const createChat = async (name: string | undefined, userIds: string[]) => {
    if (!user) return;

    try {
      let newChat: Chat;

      if (userIds.length === 1) {
        newChat = await chatApi.createChat({ userIds }).json<Chat>();
      } else {
        newChat = await chatApi
          .createChat({
            name,
            userIds,
            creatorId: user.id,
          })
          .json<Chat>();
      }

      setChats((prev) => [newChat, ...prev]);

      setSelectedChat(newChat);

      setIsCreateChatModalOpen(false);
    } catch (err) {
      console.error("Failed to create chat:", err);
      throw err;
    }
  };

  const getChatName = (chat: Chat) => {
    if (chat.name) return chat.name;

    if (!chat.isGroup && user) {
      const otherUser = chat.users.find((u) => u.id !== user.id);
      return otherUser ? otherUser.name : "Chat";
    }

    return "Unnamed Chat";
  };

  const getLastMessage = (chat: Chat) => {
    if (chat.messages && chat.messages.length > 0) {
      const lastMessage = chat.messages[chat.messages.length - 1];
      if (!lastMessage.sender) {
        return `Unknown: ${lastMessage.content}`;
      }
      const senderName =
        lastMessage.sender.id === user?.id ? "You" : lastMessage.sender.name;
      return `${senderName}: ${lastMessage.content}`;
    }
    return "No messages yet";
  };

  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleNewChat = () => {
    setIsCreateChatModalOpen(true);
  };

  if (isLoading && chats.length === 0) {
    return <LoadingSpinner fullScreen message="Loading your chats..." />;
  }

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: "background.paper",
          color: "text.primary",
          boxShadow: 1,
        }}
      >
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {selectedChat ? getChatName(selectedChat) : "ChatApp"}
          </Typography>
          <IconButton
            color="inherit"
            onClick={handleLogout}
            aria-label="logout"
          >
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          flex: 1,
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          borderRight: 1,
          borderColor: "divider",
          mt: "64px",
          minWidth: 0,
          maxWidth: "33.33%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 2,
          }}
        >
          <Typography variant="h6">Your Chats</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleNewChat}
            size="small"
          >
            New Chat
          </Button>
        </Box>

        <Divider />

        {socketError && (
          <Alert severity="warning" sx={{ m: 1 }}>
            Connection issue: {socketError}
          </Alert>
        )}

        <ErrorMessage error={error} />

        {chats.length === 0 ? (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography color="text.secondary">
              No chats yet. Start by creating a new chat!
            </Typography>
          </Box>
        ) : (
          <List sx={{ pt: 0, overflowY: "auto", flex: 1 }}>
            {chats.map((chat) => (
              <ListItem
                key={chat.id}
                disablePadding
                divider
                component="div"
                sx={{
                  backgroundColor:
                    selectedChat?.id === chat.id
                      ? "rgba(25, 118, 210, 0.08)"
                      : "transparent",
                }}
              >
                <ListItemButton onClick={() => handleChatSelect(chat)}>
                  <ListItemAvatar>
                    <Avatar>{getChatName(chat).charAt(0).toUpperCase()}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={getChatName(chat)}
                    secondary={getLastMessage(chat)}
                    primaryTypographyProps={{
                      noWrap: true,
                      fontWeight:
                        selectedChat?.id === chat.id ? "bold" : "normal",
                    }}
                    secondaryTypographyProps={{
                      noWrap: true,
                    }}
                  />
                  {chat.messages && chat.messages.length > 0 && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ ml: 1 }}
                    >
                      {getRelativeTime(
                        chat.messages[chat.messages.length - 1].createdAt
                      )}
                    </Typography>
                  )}
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      <Box
        component="main"
        sx={{
          flex: 2,
          width: 0,
          minWidth: 0,
          marginTop: "64px",
          display: "flex",
          flexDirection: "column",
          height: "calc(100vh - 64px)",
        }}
      >
        {!selectedChat ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              p: 3,
            }}
          >
            <Typography variant="h5" color="text.secondary" gutterBottom>
              Select a chat to start messaging
            </Typography>
            <Typography color="text.secondary">
              Or create a new chat to connect with friends
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleNewChat}
              sx={{ mt: 3 }}
            >
              New Chat
            </Button>
          </Box>
        ) : (
          <>
            <ErrorMessage error={messageError} />

            {hasMoreMessages && (
              <Box sx={{ p: 1, textAlign: "center" }}>
                <Button
                  variant="text"
                  onClick={loadMoreMessages}
                  disabled={isLoadingMessages}
                >
                  {isLoadingMessages ? "Loading..." : "Load Earlier Messages"}
                </Button>
              </Box>
            )}

            <MessageList
              messages={messages}
              currentUser={user}
              isLoading={isLoadingMessages && messages.length === 0}
              chatId={selectedChat?.id}
            />

            <Box sx={{ p: 2, bgcolor: "background.default" }}>
              <MessageInput
                onSendMessage={sendMessage}
                disabled={!isConnected}
              />
              {!isConnected && (
                <Typography
                  variant="caption"
                  color="error"
                  sx={{ mt: 1, display: "block", textAlign: "center" }}
                >
                  You are currently offline. Messages cannot be sent.
                </Typography>
              )}
            </Box>
          </>
        )}
      </Box>

      <CreateChatModal
        open={isCreateChatModalOpen}
        onClose={() => setIsCreateChatModalOpen(false)}
        onCreateChat={createChat}
      />
    </Box>
  );
}
