"use client";

import { useState } from "react";
import { Box, TextField, IconButton, Paper } from "@mui/material";
import {
  Send as SendIcon,
  EmojiEmotions as EmojiIcon,
} from "@mui/icons-material";

interface MessageInputProps {
  onSendMessage: (content: string) => Promise<void>;
  disabled?: boolean;
}

const MessageInput = ({
  onSendMessage,
  disabled = false,
}: MessageInputProps) => {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() || isSubmitting || disabled) return;

    setIsSubmitting(true);
    try {
      await onSendMessage(message.trim());
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      elevation={3}
      sx={{
        p: 1,
        display: "flex",
        alignItems: "center",
        borderRadius: 3,
      }}
    >
      <TextField
        fullWidth
        multiline
        maxRows={4}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="Type a message..."
        disabled={disabled}
        InputProps={{
          disableUnderline: true,
        }}
        variant="standard"
        sx={{
          mx: 1,
          "& .MuiInputBase-root": {
            padding: "8px 0",
          },
        }}
      />

      <IconButton
        color="primary"
        type="submit"
        disabled={!message.trim() || isSubmitting || disabled}
      >
        <SendIcon />
      </IconButton>
    </Paper>
  );
};

export default MessageInput;
