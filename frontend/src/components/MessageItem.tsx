"use client";

import { Box, Typography, Avatar, Paper, Tooltip } from "@mui/material";
import { Message, User } from "@/types";
import { formatMessageDate } from "@/utils/dateFormat";

interface MessageItemProps {
  message: Message;
  currentUser: User | null;
  showAvatar?: boolean;
}

const MessageItem = ({
  message,
  currentUser,
  showAvatar = true,
}: MessageItemProps) => {
  const isOwnMessage = message.sender.id === currentUser?.id;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: isOwnMessage ? "row-reverse" : "row",
        alignItems: "flex-end",
        mb: 1.5,
        maxWidth: "80%",
        alignSelf: isOwnMessage ? "flex-end" : "flex-start",
      }}
    >
      {/* Avatar - only shown for other users' messages */}
      {!isOwnMessage && showAvatar && (
        <Avatar sx={{ width: 36, height: 36, mr: 1 }} alt={message.sender.name}>
          {message.sender.name.charAt(0).toUpperCase()}
        </Avatar>
      )}

      <Box sx={{ display: "flex", flexDirection: "column" }}>
        {!isOwnMessage && showAvatar && (
          <Typography variant="caption" sx={{ ml: 1, mb: 0.5 }}>
            {message.sender.name}
          </Typography>
        )}

        <Tooltip title={formatMessageDate(message.createdAt)} placement="left">
          <Paper
            elevation={1}
            sx={{
              p: 1.5,
              borderRadius: 2,
              maxWidth: "100%",
              backgroundColor: isOwnMessage
                ? "primary.light"
                : "background.paper",
              color: isOwnMessage ? "white" : "text.primary",
              ml: isOwnMessage ? 0 : showAvatar ? 0 : 5,
              mr: isOwnMessage ? (showAvatar ? 0 : 5) : 0,
              wordBreak: "break-word",
            }}
          >
            <Typography variant="body1">{message.content}</Typography>
          </Paper>
        </Tooltip>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            mt: 0.5,
            alignSelf: isOwnMessage ? "flex-end" : "flex-start",
            mx: 1,
          }}
        >
          {formatMessageDate(message.createdAt)}
        </Typography>
      </Box>
    </Box>
  );
};

export default MessageItem;
