"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import io, { Socket } from "socket.io-client";

import { getToken } from "@/utils/auth";
import { Message } from "@/types";

interface ServerToClientEvents {
  newMessage: (message: Message) => void;
  connect_error: (err: Error) => void;
  disconnect: (reason: string) => void;
  connect: () => void;
}

interface ClientToServerEvents {
  joinChat: (chatId: string) => void;
  sendMessage: (data: {
    chatId: string;
    content: string;
    senderId: string;
  }) => void;
}

export const useSocket = () => {
  const socketRef = useRef<ReturnType<typeof io> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentChatIdRef = useRef<string | null>(null);

  const joinChat = useCallback(
    (chatId: string) => {
      if (socketRef.current && isConnected) {
        if (currentChatIdRef.current !== chatId) {
          currentChatIdRef.current = chatId;
          socketRef.current.emit("joinChat", chatId);
        }
      } else {
        currentChatIdRef.current = chatId;
      }
    },
    [isConnected]
  );

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setError("Authentication required");
      return;
    }
    const SOCKET_URL =
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3005";
    socketRef.current = io(SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    const socket = socketRef.current;
    socket.on("connect", () => {
      setIsConnected(true);
      setError(null);
      if (currentChatIdRef.current) {
        socket.emit("joinChat", currentChatIdRef.current);
      }
    });
    socket.on("connect_error", (err: Error) => {
      setIsConnected(false);
      setError("Failed to connect to chat server");
    });
    socket.on("disconnect", (reason: string) => {
      setIsConnected(false);
    });
    return () => {
      socket.disconnect();
      socketRef.current = null;
      currentChatIdRef.current = null;
    };
  }, []);

  const sendMessage = useCallback(
    (chatId: string, content: string, senderId: string) => {
      if (socketRef.current && isConnected) {
        socketRef.current.emit("sendMessage", { chatId, content, senderId });
      }
    },
    [isConnected]
  );

  const subscribeToMessages = useCallback(
    (callback: (message: Message) => void) => {
      if (!socketRef.current) {
        return () => {};
      }
      const wrappedCallback = (msg: Message) => {
        callback(msg);
      };
      socketRef.current.off("newMessage");
      socketRef.current.on("newMessage", wrappedCallback);
      return () => {
        if (socketRef.current) {
          socketRef.current.off("newMessage", wrappedCallback);
        }
      };
    },
    []
  );

  return {
    isConnected,
    error,
    joinChat,
    sendMessage,
    subscribeToMessages,
  };
};
