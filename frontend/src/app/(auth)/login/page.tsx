"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  Card,
  Container,
  Typography,
  Link as MuiLink,
  Alert,
} from "@mui/material";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { loginSchema } from "@/utils/validationSchemas";
import { ApiError } from "@/types";
import { z } from "zod";

export type LoginFormData = z.infer<typeof loginSchema>;
import FormInput from "@/components/FormInput";
import ErrorMessage from "@/components/ErrorMessage";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const [error, setError] = useState<ApiError | null>(null);
  const searchParams = useSearchParams();
  const registeredParam = searchParams.get("registered");
  const isNewlyRegistered = registeredParam === "true";

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    try {
      await login(data.email, data.password);
    } catch (err) {
      console.error("Login error:", err);
      setError(err as ApiError);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Card sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Log in to ChatApp
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          align="center"
          sx={{ mb: 4 }}
        >
          Enter your credentials to access your account
        </Typography>

        {isNewlyRegistered && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Account created successfully! You can now log in.
          </Alert>
        )}

        <ErrorMessage error={error} onClose={() => setError(null)} />

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <FormInput
                {...field}
                label="Email"
                error={!!errors.email}
                helperText={errors.email?.message}
                autoComplete="email"
                formControlProps={{ sx: { mb: 3 } }}
              />
            )}
          />

          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <FormInput
                {...field}
                label="Password"
                isPassword
                error={!!errors.password}
                helperText={errors.password?.message}
                autoComplete="current-password"
                formControlProps={{ sx: { mb: 4 } }}
              />
            )}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={isLoading}
            sx={{ mb: 2 }}
          >
            {isLoading ? "Logging in..." : "Log In"}
          </Button>

          <Typography align="center">
            Don't have an account?{" "}
            <MuiLink component={Link} href="/signup">
              Sign up
            </MuiLink>
          </Typography>
        </Box>
      </Card>

      {isLoading && <LoadingSpinner fullScreen />}
    </Container>
  );
}
