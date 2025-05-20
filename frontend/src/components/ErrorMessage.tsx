"use client";

import { Alert, AlertTitle, Box, Collapse } from "@mui/material";
import { ApiError } from "@/types";

interface ErrorMessageProps {
  error: ApiError | string | null;
  onClose?: () => void;
}

const ErrorMessage = ({ error, onClose }: ErrorMessageProps) => {
  if (!error) return null;

  let errorMessage: string | string[] = "";
  let statusCode: number | undefined;

  if (typeof error === "string") {
    errorMessage = error;
  } else {
    errorMessage = error.message;
    statusCode = error.statusCode;
  }

  return (
    <Box sx={{ width: "100%", mb: 2 }}>
      <Collapse in={!!error}>
        <Alert
          severity="error"
          onClose={onClose}
          sx={{ "& .MuiAlert-message": { width: "100%" } }}
        >
          <AlertTitle>Error {statusCode && `(${statusCode})`}</AlertTitle>
          {Array.isArray(errorMessage) ? (
            <ul style={{ margin: 0, paddingLeft: "1.5rem" }}>
              {errorMessage.map((msg, idx) => (
                <li key={idx}>{msg}</li>
              ))}
            </ul>
          ) : (
            errorMessage
          )}
        </Alert>
      </Collapse>
    </Box>
  );
};

export default ErrorMessage;
