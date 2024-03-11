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
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useEffect } from "react";
import { useLayoutEffect } from "react";

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

export default function Register() {
  const { formData, setFormData, formError, setFormError, loginUser } = useAuth();
  const [sent, setSent] = useState(false);
  const [counter, setCounter] = useState(
    localStorage.getItem("registerCounter")
      ? localStorage.getItem("registerCounter")
      : 0
  );
  const [disabled, setDisabled] = useState(
    localStorage.getItem("registerDisabled") === true ? true : false
  );

  const navigate = useNavigate();

  const handleDisable = (seconds) => {
    clearInterval();
    setCounter(seconds);

    const counterInterval = setInterval(() => {
      setCounter((previousCounter) => {
        if (previousCounter <= 1) {
          clearInterval(counterInterval);
          setDisabled(false);
          localStorage.setItem("registerDisabled", false);
        }
        localStorage.setItem("registerCounter", previousCounter - 1);
        return previousCounter - 1;
      });
    }, 1000);
  };

  const handleChange = (event) => {
    event.preventDefault();

    setFormData({
      ...formData,
      [event.target.name]: event.target.value.trim(),
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setDisabled(true);
    localStorage.setItem("registerDisabled", true);
    handleDisable(5);

    axiosInstance
      .post("api-auth/register/", {
        email: formData.email,
        username: formData.username,
        password: formData.password,
      })
      .then((response) => {
        setSent(true);
        handleDisable(60);
        setFormError((previousState) => {
          return { ...previousState, email: "" };
        });
        loginUser()
        navigate("/confirm");
      })
      .catch((error) => {
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
  useEffect(() => {
    handleDisable(counter);

    if (counter != 0) {
      setDisabled(true);
      localStorage.setItem("registerDisabled", true);
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
            Sign up
          </Typography>
          <Box
            component="form"
            noValidate
            onSubmit={handleSubmit}
            sx={{ mt: 3 }}
          >
            <Grid container spacing={2} onChange={handleChange}>
              <Grid item xs={12}>
                <TextField
                  type="email"
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                />
              </Grid>
              {formError.email ? (
                <small style={{ color: "red", marginLeft: "15px" }}>
                  {formError.email}
                </small>
              ) : null}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="username"
                  label="Username"
                  name="username"
                  autoComplete="username"
                />
              </Grid>
              {formError.username ? (
                <small style={{ color: "red", marginLeft: "15px" }}>
                  {formError.username}
                </small>
              ) : null}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                />
              </Grid>
              {formError.password ? (
                <small style={{ color: "red", marginLeft: "15px" }}>
                  {formError.password}
                </small>
              ) : null}
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox value="allowExtraEmails" color="primary" />
                  }
                  label="I want to receive inspiration, marketing promotions and updates via email."
                />
              </Grid>
            </Grid>

            {formData.email != "" &&
            formData.username != "" &&
            formData.password != "" &&
            !disabled ? (
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                onClick={handleSubmit}
              >
                Sign Up
              </Button>
            ) : (
              <Button
                type="submit"
                fullWidth
                disabled
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                onClick={handleSubmit}
              >
                Sign Up
              </Button>
            )}

            <Grid container justifyContent="flex-end">
              <Grid item>
                <small>
                  <NavLink to="/login">
                    Already have an account? Sign in
                  </NavLink>
                </small>
              </Grid>
            </Grid>
          </Box>
        </Box>
        <Copyright sx={{ mt: 5 }} />
      </Container>
    </ThemeProvider>
  );
}
