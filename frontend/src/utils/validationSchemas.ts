import { z } from "zod";

/**
 * Validation schema for signup form
 */
export const signupSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name cannot exceed 50 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

/**
 * Validation schema for login form
 */
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

/**
 * Validation schema for creating a chat
 */
export const createGroupChatSchema = z.object({
  name: z
    .string()
    .min(1, "Group name is required")
    .max(50, "Group name cannot exceed 50 characters"),
  userIds: z.array(z.string().min(1)).min(1, "Please select at least one user"),
});

/**
 * Validation schema for creating a direct message chat
 */
export const createDirectChatSchema = z.object({
  userIds: z
    .array(z.string().min(1))
    .length(1, "Please select exactly one user for direct message"),
});

/**
 * Validation schema for sending a message
 */
export const messageSchema = z.object({
  content: z
    .string()
    .min(1, "Message cannot be empty")
    .max(1000, "Message is too long (max 1000 characters)"),
});
