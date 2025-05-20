"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
  FormHelperText,
  Typography,
  Box,
  Chip,
  CircularProgress,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createGroupChatSchema,
  createDirectChatSchema,
} from "@/utils/validationSchemas";
import userApi from "@/lib/api";
import { User } from "@/types";

interface CreateChatModalProps {
  open: boolean;
  onClose: () => void;
  onCreateChat: (name: string | undefined, userIds: string[]) => Promise<void>;
}

const CreateChatModal = ({
  open,
  onClose,
  onCreateChat,
}: CreateChatModalProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGroupChat, setIsGroupChat] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<{
    name?: string;
    userIds: string[];
  }>({
    resolver: zodResolver(
      isGroupChat ? createGroupChatSchema : createDirectChatSchema
    ),
    defaultValues: {
      name: "",
      userIds: [],
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = form;

  useEffect(() => {
    if (open) fetchUsers();
  }, [open]);

  useEffect(() => {
    if (!open) {
      reset();
      setIsGroupChat(false);
      setError(null);
    }
  }, [open, reset]);

  useEffect(() => {
    form.reset(form.getValues(), {
      keepErrors: false,
      keepDirty: false,
      keepTouched: false,
    });
    form.unregister("name");
    form.unregister("userIds");
    form.reset({
      name: "",
      userIds: [],
    });
  }, [isGroupChat]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const fetchedUsers = await userApi.url("/api/users").get().json<User[]>();
      setUsers(fetchedUsers);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError("Failed to load users. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: {
    name?: string;
    userIds: string[] | string;
  }) => {
    try {
      let userIds: string[] = [];
      if (Array.isArray(data.userIds)) {
        userIds = data.userIds;
      } else if (typeof data.userIds === "string") {
        userIds = data.userIds.split(",").map((id) => id.trim());
      }
      await onCreateChat(data.name, userIds);
      onClose();
    } catch (err) {
      console.error("Failed to create chat:", err);
      setError("Failed to create chat. Please try again.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isGroupChat ? "Create Group Chat" : "New Conversation"}
      </DialogTitle>

      <DialogContent>
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <Box sx={{ mb: 2 }}>
          <Button
            variant={!isGroupChat ? "contained" : "outlined"}
            onClick={() => setIsGroupChat(false)}
            sx={{ mr: 1 }}
          >
            Direct Message
          </Button>
          <Button
            variant={isGroupChat ? "contained" : "outlined"}
            onClick={() => setIsGroupChat(true)}
          >
            Group Chat
          </Button>
        </Box>

        <form id="create-chat-form" onSubmit={handleSubmit(onSubmit)}>
          {isGroupChat && (
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Group Name"
                  fullWidth
                  margin="normal"
                  error={!!errors.name}
                  helperText={errors.name?.message?.toString()}
                />
              )}
            />
          )}

          <Controller
            name="userIds"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth margin="normal" error={!!errors.userIds}>
                <InputLabel id="select-users-label">
                  Select {isGroupChat ? "Users" : "User"}
                </InputLabel>
                <Select
                  {...field}
                  labelId="select-users-label"
                  multiple={isGroupChat}
                  input={
                    <OutlinedInput
                      label={`Select ${isGroupChat ? "Users" : "User"}`}
                    />
                  }
                  onChange={(e) =>
                    field.onChange(
                      isGroupChat ? e.target.value : [e.target.value as string]
                    )
                  }
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {(Array.isArray(selected) ? selected : [selected]).map(
                        (userId) => {
                          const user = users.find((u) => u.id === userId);
                          return (
                            <Chip
                              key={userId}
                              label={user?.name || user?.email || userId}
                            />
                          );
                        }
                      )}
                    </Box>
                  )}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <MenuItem disabled>
                      <CircularProgress size={24} sx={{ mx: "auto", my: 1 }} />
                    </MenuItem>
                  ) : users.length === 0 ? (
                    <MenuItem disabled>No users found</MenuItem>
                  ) : (
                    users.map((user) => (
                      <MenuItem key={user.id} value={user.id}>
                        {isGroupChat && (
                          <Checkbox checked={field.value.includes(user.id)} />
                        )}
                        <ListItemText
                          primary={user.name}
                          secondary={user.email}
                        />
                      </MenuItem>
                    ))
                  )}
                </Select>
                {errors.userIds && (
                  <FormHelperText>
                    {errors.userIds.message?.toString()}
                  </FormHelperText>
                )}
              </FormControl>
            )}
          />
        </form>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          type="submit"
          form="create-chat-form"
          variant="contained"
          disabled={isLoading}
        >
          Create Chat
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateChatModal;
