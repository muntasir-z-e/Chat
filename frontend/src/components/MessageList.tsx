"use client";

import { useEffect, useRef, useLayoutEffect } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { Message, User } from "@/types";
import MessageItem from "./MessageItem";

interface MessageListProps {
  messages: Message[];
  currentUser: User | null;
  isLoading?: boolean;
  chatId?: string;
}

const MessageList = ({
  messages,
  currentUser,
  isLoading = false,
  chatId,
}: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef(messages.length);
  const prevChatIdRef = useRef<string | undefined>(chatId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const prevLength = prevMessagesLengthRef.current;
    const isNewMessage = messages.length > prevLength;

    if (isNewMessage) {
      scrollToBottom();
    }

    prevMessagesLengthRef.current = messages.length;
  }, [messages.length]);

  useEffect(() => {
    if (chatId && prevChatIdRef.current !== chatId) {
      scrollToBottom();
      prevChatIdRef.current = chatId;
    }
  }, [chatId]);

  useLayoutEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, []);

  const renderMessages = () => {
    const sortedMessages = [...messages].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    return sortedMessages.map((message, index) => {
      const prevMessage = index > 0 ? sortedMessages[index - 1] : null;
      const isSameSender =
        prevMessage && prevMessage.sender.id === message.sender.id;
      const showAvatar = !isSameSender;

      return (
        <MessageItem
          key={message.id}
          message={message}
          currentUser={currentUser}
          showAvatar={showAvatar}
        />
      );
    });
  };

  return (
    <Box
      ref={containerRef}
      sx={{
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
        overflowY: "auto",
        p: 2,
        "&::-webkit-scrollbar": {
          width: "8px",
        },
        "&::-webkit-scrollbar-track": {
          background: "transparent",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "rgba(0,0,0,0.2)",
          borderRadius: "4px",
        },
      }}
    >
      {isLoading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <CircularProgress />
        </Box>
      ) : messages.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <Typography color="text.secondary">
            No messages yet. Start the conversation!
          </Typography>
        </Box>
      ) : (
        <>
          {renderMessages()}
          <div ref={messagesEndRef} />
        </>
      )}
    </Box>
  );
};

export default MessageList;
