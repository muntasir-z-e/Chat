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
} from "@mui/material";
import Link from "next/link";
import { signupSchema } from "@/utils/validationSchemas";
import { SignupFormData, ApiError } from "@/types";
import FormInput from "@/components/FormInput";
import ErrorMessage from "@/components/ErrorMessage";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useAuth } from "@/hooks/useAuth";

export default function SignupPage() {
  const { signup, isLoading } = useAuth();
  const [error, setError] = useState<ApiError | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: SignupFormData) => {
    setError(null);
    try {
      await signup(data.name, data.email, data.password);
    } catch (err) {
      console.error("Signup error:", err);
      setError(err as ApiError);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Card sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Create an Account
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          align="center"
          sx={{ mb: 4 }}
        >
          Sign up to start chatting with your friends
        </Typography>

        <ErrorMessage error={error} onClose={() => setError(null)} />

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <FormInput
                {...field}
                label="Full Name"
                error={!!errors.name}
                helperText={errors.name?.message}
                autoComplete="name"
                formControlProps={{ sx: { mb: 3 } }}
              />
            )}
          />

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
                autoComplete="new-password"
                formControlProps={{ sx: { mb: 3 } }}
              />
            )}
          />

          <Controller
            name="confirmPassword"
            control={control}
            render={({ field }) => (
              <FormInput
                {...field}
                label="Confirm Password"
                isPassword
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
                autoComplete="new-password"
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
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>

          <Typography align="center">
            Already have an account?{" "}
            <MuiLink component={Link} href="/login">
              Log in
            </MuiLink>
          </Typography>
        </Box>
      </Card>

      {isLoading && <LoadingSpinner fullScreen />}
    </Container>
  );
}
