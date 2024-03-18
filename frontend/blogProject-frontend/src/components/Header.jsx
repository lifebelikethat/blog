import React, { useState, useRef } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Link from "@mui/material/Link";
import {
  Button,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  ClickAwayListener,
} from "@mui/material";
import { NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Menu } from "@mui/material";
import "./modal.css";
import CloseIcon from "@mui/icons-material/Close";
import { IconButton } from "@mui/material";
import { TextField } from "@mui/material";
import { axiosInstance } from "../axios";

const defaultTheme = createTheme({
  typography: {
    button: {
      textTransform: "none",
    },
  },
  InputProps: {
    disableUnderline: true,
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        border: "none",
        outline: "none",
      },
    },
  },
});

function Header() {
  const { user, userToken, logoutUser, navigate } = useAuth();
  const [modal, setModal] = useState(false);
  const [anchor, setAnchor] = useState(null);
  const [postData, setPostData] = useState({ content: "", image: null });
  const [postButtonDisabled, setPostButtonDisabled] = useState(true);
  const [postErrorMessage, setPostErrorMessage] = useState("");
  const open = Boolean(anchor);

  const inputref = useRef();

  const handleClick = (event) => {
    setAnchor(event.currentTarget);
  };

  const handleClose = () => {
    setAnchor(null);
  };

  const toggleModal = () => {
    setModal(() => {
      if (!modal == false) setPostData({ content: "", image: null });
      return !modal;
    });
    
  };

  const handlePostChange = (event) => {
    event.preventDefault();

    if (event.target.name === "content") {
      setPostData(() => {
        if (postData.image != null && postData.image.size > 2000000) {
          setPostButtonDisabled(true);
        } else if (postData.image == null && event.target.value.length < 0) {
          setPostButtonDisabled(true);
        } else {
          setPostButtonDisabled(false);
        }
        return { content: event.target.value, image: postData.image }
      });
    } else if (event.target.name === "image") {
      setPostData(() => { 
        if (postData.content.length < 1) {
          setPostButtonDisabled(true);
        } else if (event.target.files[0].size > 2000000) {
          setPostButtonDisabled(true);
          setPostErrorMessage("maximum size of 2 mb.")
        } else {
          setPostButtonDisabled(false);
          setPostErrorMessage("");
        }
        return { content: postData.content, image: event.target.files[0] }
      });
    };
  };

  const handlePostData = (event) => {
    event.preventDefault();
    let data = {};
    console.log(postData.image)
    
    if (postData.image != null) {
      console.log('not null')
      console.log(postData.image)
      data = {
        content: postData.content,
        image: postData.image,
        author: user.user_id,
      }
    } else {
      console.log('null')
      data = {
        content: postData.content,
        author: user.user_id,
      }
    }

    axiosInstance
      .post(
        "api-main/blogs/",
        {
          content: postData.content,
          image: postData.image,
          author: user.user_id,
        },
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `JWT ${userToken.access}`,
          },
        }
      )
      .then((response) => {
        console.log(response);
        toggleModal();
        window.location.reload();
      })
      .catch((error) => {
        console.log(error);
      });
  };
  return (
    <div id="header">
      <ThemeProvider theme={defaultTheme}>
        <CssBaseline />
        <AppBar
          position="static"
          color="default"
          elevation={0}
          sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}
          styles={{ marginBottom: 0 }}
          fullwidth="true"
        >
          <Toolbar sx={{ flexWrap: "wrap" }}>
            <Typography
              variant="h6"
              color="inherit"
              noWrap
              sx={{ flexGrow: 1 }}
            >
              <a
                href="/"
                style={{
                  textDecoration: "none",
                  color: "black",
                  fontFamily: "Proxima-Nova",
                }}
              >
                Home
              </a>
            </Typography>

            {user ? (
              <Button
                variant="contained"
                sx={{ my: 1, mx: 1.5 }}
                style={{ borderRadius: "25px", marginRight: "0px" }}
                className="btn-modal"
                onClick={toggleModal}
                disableElevation={true}
              >
                Post
              </Button>
            ) : null}

            {/* post modal */}
            {modal ? (
              <div className="modal">
                <div className="overlay"></div>
                <div className="modal-content">
                  <IconButton className="close-modal" onClick={toggleModal}>
                    <CloseIcon />
                  </IconButton>

                  <TextField
                    variant="standard"
                    multiline
                    maxRows={15}
                    style={{ marginTop: "15px" }}
                    autoFocus
                    InputProps={{
                      disableUnderline: true,
                    }}
                    fullWidth
                    placeholder="What's on your mind?"
                    spellCheck="false"
                    value={postData.content}
                    onChange={handlePostChange}
                    name="content"
                  ></TextField>
                  <input
                    accept="image/*"
                    name="image"
                    type="file"
                    onChange={handlePostChange}
                  />
                  <hr />
                  <small style={{color: "red",}}>{postErrorMessage}</small>
                <Button
                variant="contained"
                sx={{ my: 1, mx: 1.5 }}
                style={{
                  borderRadius: "25px",
                    float: "right",
                    marginRight: 0,
                }}
                onClick={handlePostData}
                className="btn-modal"
                disabled={postButtonDisabled}
                >
                Post
                </Button>
                </div>
              </div>
            ) : null}

            {!user ? (
              <NavLink to="/login">
                <Button variant="outlined" sx={{ my: 1, mx: 1.5 }}>
                  Login
                </Button>
              </NavLink>
            ) : (
              <>
                <Button
                  sx={{ my: 1, mx: 1.5, ":hover": { bgcolor: "inherit" } }}
                  id="dropdown"
                  onClick={handleClick}
                  aria-controls={open ? dropdown : null}
                  aria-haspopup="true"
                  aria-expanded={open ? "true" : null}
                  style={{ color: "black" }}
                >
                  {user.username}
                </Button>
                <Popper id="dropdown" anchorEl={anchor} open={open}>
                  <Paper>
                    <ClickAwayListener onClickAway={() => setAnchor(null)}>
                      <MenuList>
                        <MenuItem
                          onClick={() => {
                            handleClose();
                            navigate(`/account`);
                          }}
                        >
                          Account
                        </MenuItem>

                        <MenuItem
                          onClick={() => {
                            handleClose();
                            navigate(`${user.username}`);
                          }}
                        >
                          Profile
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            handleClose();
                            navigate("/change-password");
                          }}
                        >
                          Change Password
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            handleClose();
                            logoutUser();
                          }}
                        >
                          Logout
                        </MenuItem>
                      </MenuList>
                    </ClickAwayListener>
                  </Paper>
                </Popper>
              </>
            )}
          </Toolbar>
        </AppBar>
      </ThemeProvider>
    </div>
  );
}

export default Header;
