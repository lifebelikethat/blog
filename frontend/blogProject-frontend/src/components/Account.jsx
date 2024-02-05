import { Button, TextField } from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { useState, useEffect } from "react";
import "./Account.css";
import { axiosInstance } from "../axios";
import { jwtDecode } from "jwt-decode";
import { useParams } from "react-router-dom";
import AccountSettings from "./AccountSettings";

const Account = () => {
  const setting = useParams().setting;
  const {
    user,
    setUser,
    setUserToken,
    formData,
    setFormData,
    relogUser,
    navigate,
    verified,
    setVerified,
    userBlockedList,
  } = useAuth();

  const handleChange = (event) => {
    setFormData((prevData) => {
      return { ...prevData, [event.target.name]: event.target.value };
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    relogUser({ username: user.username });
  };

  if (!setting)
    if (verified)
      return (
        <>
          <div id="account-info-containers">
            <h3
              style={{
                textAlign: "center",
                marginTop: "0px",
                paddingTop: "10px",
                paddingBottom: "0px",
              }}
            >
              Account Information
            </h3>
            <div
              className="account-info-container"
              onClick={() => navigate("/account/username")}
            >
              <p>Username</p>
              <small>@{user.username}</small>
            </div>

            <div
              className="account-info-container"
              onClick={() => navigate("/account/email")}
            >
              <p>Email</p>
              <small>{user.email ? user.email : <br />}</small>
            </div>

            <div
              className="account-info-container"
              onClick={() => navigate("/account/blocked")}
            >
              <p>Blocked Users</p>
            </div>
          </div>
        </>
      );
    else {
      return (
        <div id="account-info-containers">
          <div
            className="account-info-container"
            style={{ backgroundColor: "white", cursor: "default" }}
          >
            <small>
              For your account's safety, please enter your password.
            </small>
            <form onSubmit={handleSubmit}>
              <TextField
                sx={{ marginTop: "10px" }}
                onChange={handleChange}
                label="password"
                name="password"
                value={formData.password}
                type="password"
                fullWidth
              ></TextField>

              <Button
                variant="contained"
                sx={{ marginTop: "10px", float: "right" }}
                onClick={handleSubmit}
              >
                Verify
              </Button>
            </form>
          </div>
        </div>
      );
    }
  else {
    return (
      <AccountSettings
        verified={verified}
        formData={formData}
        blockedUsers={userBlockedList}
      />
    );
  }
};

export default Account;
