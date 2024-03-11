import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { TextField, Button } from "@mui/material";
import { axiosInstance } from "../axios";
import { useAuth } from "../contexts/AuthContext";

const AccountSettings = (props) => {
  const verified = props.verified;
  const formData = props.formData;
  const blockedUsers = props.blockedUsers;

  const setting = useParams().setting;
  const [emailMessage, setEmailMessage] = useState("");
  const [disabled, setDisabled] = useState(false);
  const { setFormData, navigate, user, userToken, relogUser, userBlockedList, getUserInfo } =
    useAuth();

  const [blocked, setBlocked] = useState();

  const addRelationship = (username, status) => {
    axiosInstance
      .post(
        "api-main/relationships/",
        { from_person: user.username, to_person: username, status: status },
        { headers: { Authorization: `JWT ${userToken.access}` } }
      )
      .then((response) => {
        if (status === 1) console.log("followed");
        else if (status === 2) console.log("blocked");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const deleteRelationship = (username) => {
    axiosInstance
      .delete(`api-main/relationships/${user.username}/${username}/`, {
        headers: { Authorization: `JWT ${userToken.access}` },
      })
      .then((response) => {
        console.log("deleted relationship");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleBlock = (username) => {
    if (blocked.includes(username)) {
      setBlocked((blockedUser) => {
        let index = blockedUser.indexOf(username);
        blockedUser.splice(index);

        return [...blockedUser];
      });

      deleteRelationship(username);
    } else {
      setBlocked((blockedUser) => {
        if (!blockedUser) return [username];

        return [...blockedUser, username];
      });

      addRelationship(username, 2);
    }
  };

  const handleChange = (event) => {
    event.preventDefault();
    console.log(user.username);

    setFormData({
      ...formData,
      [event.target.name]: event.target.value.trim(),
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    setDisabled(true);

    // when changing username
    if (setting === "username") {
      axiosInstance
        .put(
          `api-main/user/`,
          {
            username: formData.username,
          },
          {
            headers: {
              Authorization: `JWT ${userToken.access}`,
            },
          }
        )
        .then((response) => {
          relogUser({
            username: formData.username,
            password: formData.password,
          });

          navigate("/account");
        })
        .catch((error) => console.log(error));
    } else if (setting === "email") {
      console.log("sending email");
      axiosInstance
        .put(
          "api-main/user/",
          { email: formData.email },
          {
            headers: { Authorization: user ? `JWT ${userToken.access}` : null },
          }
        )
        .then((response) => {
          setDisabled(false);
          setEmailMessage("Check your inbox to confirm your email");
        })
        .catch((error) => {
          console.log(error);
          setEmailMessage(error.response.data.email);
        });
    }
  };

  useEffect(() => {
    if (!verified) navigate("/account");

    userBlockedList.map((username) => {
      setBlocked((prev) => {
        if (!prev) return [username];

        return [...prev, username];
      });
    });
  }, []);

  if (setting === "username") {
    return (
      <div id="account-info-containers">
        <div className="account-info-container">
          <form onSubmit={handleSubmit}>
            <TextField
              label="username"
              name="username"
              onChange={handleChange}
              fullWidth
              autoFocus
            />

            <Button
              onClick={handleSubmit}
              variant="contained"
              sx={{ marginTop: "10px", float: "right" }}
            >
              save
            </Button>
          </form>
        </div>
      </div>
    );
  } else if (setting === "email") {
    return (
      <div id="account-info-containers">
        <div className="account-info-container">
          <form onSubmit={handleSubmit}>
            <TextField
              disabled={disabled}
              label="email address"
              value={formData.email}
              onChange={handleChange}
              name="email"
              fullWidth
              autoFocus
            />
            <small style={{"color": "red"}}>{emailMessage}</small>

            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={disabled}
              sx={{ marginTop: "10px", float: "right" }}
            >
              send email
            </Button>
          </form>
        </div>
      </div>
    );
  } else if (setting === "blocked") {
    return (
      <div id="account-info-containers">
        {userBlockedList.map((username, index) =>
          username != "a" ? (
            <div
              key={index}
              className="account-info-container"
              style={{ overflow: "auto" }}
            >
              <small>@{username}</small>

              <Button
                size="small"
                disableElevation={true}
                variant="outlined"
                style={{
                  float: "right",
                }}
                onClick={() => {
                  handleBlock(username);
                }}
              >
                {blocked
                  ? blocked.includes(username)
                    ? "Unblock"
                    : "Block"
                  : "Block"}
              </Button>
            </div>
          ) : null
        )}
      </div>
    );
  }
};

export default AccountSettings;
