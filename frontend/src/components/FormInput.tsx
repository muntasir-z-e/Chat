"use client";

import React, { forwardRef } from "react";
import {
  FormControl,
  FormHelperText,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton,
  FormControlProps,
  OutlinedInputProps,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

interface FormInputProps extends Omit<OutlinedInputProps, "error"> {
  label: string;
  helperText?: string;
  error?: boolean;
  formControlProps?: FormControlProps;
  isPassword?: boolean;
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  (
    { label, helperText, error, formControlProps, isPassword, ...props },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);

    const handleClickShowPassword = () => {
      setShowPassword((show) => !show);
    };

    const handleMouseDownPassword = (
      event: React.MouseEvent<HTMLButtonElement>
    ) => {
      event.preventDefault();
    };

    return (
      <FormControl
        error={error}
        variant="outlined"
        fullWidth
        {...formControlProps}
      >
        <InputLabel htmlFor={props.id || `input-${label}`}>{label}</InputLabel>
        <OutlinedInput
          ref={ref}
          id={props.id || `input-${label}`}
          type={isPassword ? (showPassword ? "text" : "password") : props.type}
          label={label}
          {...props}
          endAdornment={
            isPassword ? (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ) : (
              props.endAdornment
            )
          }
        />
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>
    );
  }
);

FormInput.displayName = "FormInput";

export default FormInput;
