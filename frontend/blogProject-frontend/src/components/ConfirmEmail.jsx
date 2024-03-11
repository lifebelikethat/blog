import { unstable_HistoryRouter, useParams } from "react-router-dom";
import { axiosInstance } from "../axios";
import { useAuth } from "../contexts/AuthContext";
import { useLayoutEffect } from "react";

import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";

import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useState } from "react";
import { Link } from "@mui/material";

import { useEffect } from "react";
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

const defaultTheme = createTheme();

export default function ConfirmEmail() {
  const { formData, setFormData, navigate, setFormError, formError } =
    useAuth();

  const [counter, setCounter] = useState(
    localStorage.getItem("confirmEmailCounter")
      ? localStorage.getItem("confirmEmaiCounter")
      : 0
  );
  const [disabled, setDisabled] = useState(
    localStorage.getItem("confrimEmailDisabled") === true ? true : false
  );

  const handleDisable = (seconds) => {
    clearInterval();
    setCounter(seconds);

    const counterInterval = setInterval(() => {
      setCounter((previousCounter) => {
        if (previousCounter <= 1) {
          clearInterval(counterInterval);
          setDisabled(false);
          localStorage.setItem("confirmEmailDisabled", false);
        }
        localStorage.setItem("confirmEmailCounter", previousCounter - 1);
        return previousCounter - 1;
      });
    }, 1000);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setDisabled(true);
    localStorage.setItem("confirmEmailDisabled", true);
    handleDisable(5);

    axiosInstance
      .post("api-auth/resend-confirm-email/", {
        email: formData.email,
      })
      .then((response) => {
        handleDisable(60);
      })
      .catch((error) => {
        console.log(error);
        if (error.response.data.email) {
          setFormError((previousState) => {
            return { ...previousState, email: error.response.data.email };
          });
        } else {
          setFormError((previousState) => {
            return { ...previousState, email: false };
          });
        }

        if (error.response.data.username) {
          setFormError((previousState) => {
            return {
              ...previousState,
              username: error.response.data.username,
            };
          });
        } else {
          setFormError((previousState) => {
            return { ...previousState, username: false };
          });
        }

        if (error.response.data.password) {
          setFormError((previousState) => {
            return {
              ...previousState,
              password: error.response.data.password,
            };
          });
        } else {
          setFormError((previousState) => {
            return { ...previousState, password: false };
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

  useEffect(() => {
    handleDisable(counter);

    if (counter != 0) {
      setDisabled(true);
      localStorage.setItem("confirmEmailDisabled", true);
    }
  }, []);

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
            Confirm Email
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ mt: 1 }}
            onChange={handleChange}
          >
            <small style={{ color: "GrayText" }}>
              Email confirmation link sent.
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

            <small>
              <NavLink to="#">Change email</NavLink>
            </small>
            <br />
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
                Resend {counter <= 0 ? null : `(${counter})`}
              </Button>
            ) : (
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled
              >
                Resend {counter <= 0 ? null : `(${counter})`}
              </Button>
            )}
          </Box>
        </Box>
        <Copyright sx={{ mt: 8, mb: 4 }} />
      </Container>
    </ThemeProvider>
  );
}
