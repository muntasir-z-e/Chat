import wretch from "wretch";
import { getToken } from "@/utils/auth";
import { getUser } from "@/utils/auth";

// Create a base API client with default configuration
const api = wretch()
  .url(process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005")
  .headers({
    "Content-Type": "application/json",
  })
  // Add a request hook to include the auth token in each request (if available)
  .middlewares([
    (next) => async (url, opts) => {
      // For client-side requests, get the token and add it to headers
      if (typeof window !== "undefined") {
        const token = getToken();
        if (token) {
          opts.headers = {
            ...opts.headers,
            Authorization: `Bearer ${token}`,
          };
        }
      }
      return next(url, opts);
    },
  ]);

export default api;

// Create typed API endpoints for better TypeScript support
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    api.url("/api/auth/login").post(credentials),

  signup: (userData: { name: string; email: string; password: string }) =>
    api.url("/api/auth/signup").post(userData),

  me: () => api.url("/api/auth/profile").get(),

  logout: () => api.url("/api/auth/logout").post({}),
};

export const chatApi = {
  getChats: () => {
    return api.url(`/api/chats`).get();
  },

  getChat: (chatId: string) => api.url(`/api/chats/${chatId}`).get(),

  createChat: (data: {
    name?: string;
    userIds: string[];
    creatorId?: string;
  }) => {
    if (data.userIds.length === 1) {
      return api.url("/api/chats/one-to-one").post({
        otherUserId: data.userIds[0],
      });
    } else {
      return api.url("/api/chats/group").post({
        creatorId: data.creatorId,
        name: data.name,
        userIds: data.userIds,
      });
    }
  },

  renameChat: (chatId: string, name: string) =>
    api.url(`/api/chats/${chatId}/rename`).patch({ name }),

  addUserToChat: (chatId: string, userId: string) =>
    api.url(`/api/chats/${chatId}/add-user`).patch({ userId }),

  removeUserFromChat: (chatId: string, userId: string) =>
    api.url(`/api/chats/${chatId}/remove-user`).patch({ userId }),

  deleteChat: (chatId: string) => api.url(`/api/chats/${chatId}`).delete(),
};

export const messageApi = {
  getMessages: (chatId: string, take = 20, skip = 0) =>
    api.url(`/api/messages/${chatId}?take=${take}&skip=${skip}`).get(),

  sendMessage: (chatId: string, content: string) => {
    const user = getUser();
    return api.url("/api/messages").post({
      userId: user?.id,
      chatId,
      content,
    });
  },
};
