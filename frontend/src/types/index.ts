/**
 * User representation in the system
 */
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

/**
 * Chat room interface
 */
export interface Chat {
  id: string;
  name?: string;
  isGroup: boolean;
  users: User[];
  messages?: Message[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Message interface
 */
export interface Message {
  id: string;
  content: string;
  sender: User;
  senderId: string;
  chat: Chat | null;
  chatId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Authentication response from the API
 */
export interface AuthResponse {
  token: string;
  user: User;
}

/**
 * Generic API error response
 */
export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
}

export interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

/**
 * Create chat request parameters
 */
export interface CreateChatParams {
  name?: string;
  userIds: string[];
}
