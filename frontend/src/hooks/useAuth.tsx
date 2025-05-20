"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { authApi } from "@/lib/api";
import {
  clearAuth,
  getToken,
  getUser,
  isAuthenticated as checkAuth,
  setToken,
  setUser,
} from "@/utils/auth";
import { User, AuthResponse } from "@/types";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    try {
      if (checkAuth()) {
        const userData = await authApi.me().json<User>();
        setCurrentUser(userData);
        setUser({ ...userData, updatedAt: new Date().toISOString() });
      } else {
        setCurrentUser(null);
      }
    } catch (error) {
      console.error("Failed to refresh user data", error);
      clearAuth();
      setCurrentUser(null);
      throw error;
    }
  }, []);

  useEffect(() => {
    let refreshInterval: NodeJS.Timeout;

    if (user) {
      refreshInterval = setInterval(
        () => {
          try {
            authApi.me().json();
          } catch (error) {
            console.error("Failed to refresh token", error);
          }
        },
        20 * 60 * 1000
      );
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [user]);

  useEffect(() => {
    const initAuth = async () => {
      if (checkAuth()) {
        try {
          await refreshUser();
        } catch (error) {
          clearAuth();
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [refreshUser]);

  const handleAuthSuccess = (data: AuthResponse) => {
    setToken(data.token);
    setUser({ ...data.user, updatedAt: new Date().toISOString() });
    setCurrentUser(data.user);
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authApi
        .login({ email, password })
        .json<AuthResponse>();
      handleAuthSuccess(response);
      router.push("/chat");
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      await authApi.signup({ name, email, password }).json();
      router.push("/login?registered=true");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      clearAuth();
      setCurrentUser(null);
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
