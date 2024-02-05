import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";

import Link from "@mui/material/Link";
import { axiosInstance } from "../axios";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

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

export default function ResetPassword() {
  const { formData, setFormData, formError, setFormError, navigate } =
    useAuth();

  const emailToken = useParams().emailToken;

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log(formData);

    axiosInstance
      .post(`api-auth/reset-password/${emailToken}/`, {
        password1: formData.password1,
        password2: formData.password2,
      })
      .then((response) => {
        navigate("/login");
      })
      .catch((error) => {
        console.log(error);
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
            Reset account password
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
              id="password1"
              label="Password"
              name="password1"
              autoComplete="password1"
              autoFocus
              value={formData.password1}
            />
            {formError.password1 ? (
              <small style={{ color: "red" }}>{formError.password1}</small>
            ) : null}

            <TextField
              margin="normal"
              fullWidth
              name="password2"
              label="Confirm password"
              type="password2"
              id="password2"
              autoComplete="password2"
              value={formData.password2}
            />
            {formError.password2 ? (
              <small style={{ color: "red" }}>{formError.password2}</small>
            ) : null}

            {formData.password1 != "" && formData.password2 ? (
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Reset password
              </Button>
            ) : (
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled
              >
                Reset password
              </Button>
            )}
          </Box>
        </Box>
        <Copyright sx={{ mt: 8, mb: 4 }} />
      </Container>
    </ThemeProvider>
  );
}
