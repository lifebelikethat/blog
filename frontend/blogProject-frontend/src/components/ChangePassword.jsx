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
import { axiosInstance } from "../axios";
import { useAuth } from "../contexts/AuthContext";
import { NavLink } from "react-router-dom";

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

export default function ChangePassword() {
  const {
    formData,
    setFormData,
    userToken,
    navigate,
    formError,
    setFormError,
  } = useAuth();


  const handleSubmit = async (event) => {
    event.preventDefault();

    axiosInstance
      .post(
        "api-auth/change-password/",
        {
          password: formData.password0,
          password1: formData.password1,
          password2: formData.password2,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `JWT ${userToken.access}`,
          },
        }
      )
      .then((response) => {
        // reset formData and formError states
        setFormData((previousState) => {
          return {
            ...previousState,
            password0: "",
            password1: "",
            password2: "",
          };
        });

        setFormError((previousState) => {
          return {
            ...previousState,
            password0: false,
            password1: false,
            passord2: false,
          };
        });
        navigate("/");
      })
      .catch((error) => {
        console.log(error.response.data);

        if (error.response.data.password0) {
          setFormError((previousState) => {
            return {
              ...previousState,
              password0: error.response.data.password0,
            };
          });
        } else {
          setFormError((previousState) => {
            return { ...previousState, password0: false };
          });
        }

        if (error.response.data.password1) {
          setFormError((previousState) => {
            return {
              ...previousState,
              password1: error.response.data.password1,
            };
          });
        } else {
          setFormError((previousState) => {
            return { ...previousState, password1: false };
          });
        }

        if (error.response.data.password2) {
          setFormError((previousState) => {
            return {
              ...previousState,
              password2: error.response.data.password2,
            };
          });
        } else {
          setFormError((previousState) => {
            return { ...previousState, password2: false };
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
            Change account password
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ mt: 1 }}
            onChange={handleChange}
          >
            <TextField
              margin="normal"
              fullWidth
              id="password0"
              label="Current password"
              name="password0"
              autoComplete="password0"
              autoFocus
              value={formData.password0}
              type="password"
            />
            {formError.password0 ? (
              <small style={{ color: "red" }}>{formError.password0}</small>
            ) : null}

            <TextField
              margin="normal"
              fullWidth
              id="password1"
              label="New password"
              name="password1"
              autoComplete="password1"
              value={formData.password1}
              type="password"
            />
            {formError.password1 ? (
              <small style={{ color: "red" }}>{formError.password1}</small>
            ) : null}

            <TextField
              margin="normal"
              fullWidth
              name="password2"
              label="Confirm password"
              type="password"
              id="password2"
              autoComplete="password2"
              value={formData.password2}
            />
            {formError.password2 ? (
              <small style={{ color: "red" }}>{formError.password2}</small>
            ) : null}

            {formData.password0.trim().length > 7 &&
            formData.password1.trim().length > 7 &&
            formData.password2.trim().length > 7 ? (
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Change Password
              </Button>
            ) : (
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled
              >
                Change password
              </Button>
            )}
          </Box>
        </Box>
        <Copyright sx={{ mt: 8, mb: 4 }} />
      </Container>
    </ThemeProvider>
  );
}
