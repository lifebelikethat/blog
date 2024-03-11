import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { axiosInstance } from "../axios";
import { useEffect } from "react";

function Copyright(props) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >
      {"Copyright © "}
      <Link color="inherit" href="https://mui.com/">
        Your Website
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

// TODO remove, this demo shouldn't need to reset the theme.

const defaultTheme = createTheme();

export default function ResetPasswordEmail() {
  const { formData, setFormData, formError, setFormError } = useAuth();
  // const [disabled, setDisabled] = useState(false);

  const [counter, setCounter] = useState(
    localStorage.getItem("resetPasswordCounter")
      ? localStorage.getItem("resetPasswordCounter")
      : 0
  );
  const [disabled, setDisabled] = useState(
    localStorage.getItem("resetPasswordDisabled") === true ? true : false
  );

  React.useEffect(() => {
    handleDisable(counter);

    if (counter != 0) {
      setDisabled(true);
      localStorage.setItem("resetPasswordDisabled", true);
    }
  }, []);

  const handleDisable = (seconds) => {
    clearInterval();
    setCounter(seconds);

    const counterInterval = setInterval(() => {
      setCounter((previousCounter) => {
        if (previousCounter <= 1) {
          clearInterval(counterInterval);
          setDisabled(false);
          localStorage.setItem("resetPasswordEmaildisabled", false);
        }
        localStorage.setItem("resetPasswordCounter", previousCounter - 1);
        return previousCounter - 1;
      });
    }, 1000);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setDisabled(true);
    localStorage.setItem("resetPasswordDisabled", true);

    axiosInstance
      .post("api-auth/reset-password-email/", { email: formData.email })
      .then((response) => {
        handleDisable(60);

        setFormError((previousState) => {
          return { ...previousState, email: false };
        });
      })
      .catch((error) => {
        handleDisable(3);
        console.log(error);

        if (Array.isArray(error.response.data.email)) {
          setFormError((previousState) => {
            return {
              ...previousState,
              email: error.response.data.email[0],
            };
          });
        } else {
          setFormError((previousState) => {
            return {
              ...previousState,
              email: error.response.data.email,
            };
          });
        }
      });
  };

  const handleChange = (event) => {
    event.preventDefault();
    setFormData({
      ...formData,
      [event.target.name]: event.target.value.trim(),
    });
  };

  return (
    <>
      <ThemeProvider theme={defaultTheme}>
        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <Box
            sx={{
              marginTop: 8,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Forgot Password?
            </Typography>
            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
              sx={{ mt: 1 }}
              onChange={handleChange}
            >
              <small style={{ color: "GrayText" }}>
                Enter your email and we'll send you instructions on how to reset
                your password.
              </small>
              <TextField
                margin="normal"
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                type="email"
                autoFocus
                value={formData.email}
              />

              {formError.email ? (
                <small style={{ color: "red" }}>{formError.email}</small>
              ) : null}

              {formData.email != "" && !disabled ? (
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                >
                  Submit {counter > 0 ? `(${counter})` : null}
                </Button>
              ) : (
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  disabled
                >
                  Submit {counter > 0 ? `(${counter})` : null}
                </Button>
              )}
            </Box>
          </Box>
          <Copyright sx={{ mt: 8, mb: 4 }} />
        </Container>
      </ThemeProvider>
    </>
  );
}
