import React, { useState, useEffect, useContext, useLayoutEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { axiosInstance } from "../axios";
import { useNavigate } from "react-router-dom";

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider(props) {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    password0: "",
    password1: "",
    password2: "",
  });

  const [formError, setFormError] = useState({
    email: false,
    username: false,
    password: false,
    password0: false,
    password1: false,
    password2: false,
  });
  const [userFollowingList, setUserFollowingList] = useState([]);
  const [userBlockedList, setUserBlockedList] = useState(["a"]);
  const [loading, setLoading] = useState(true);

  const [userToken, setUserToken] = useState(
    localStorage.getItem("userToken")
      ? JSON.parse(localStorage.getItem("userToken"))
      : null
  );
  const [user, setUser] = useState(
    userToken ? jwtDecode(userToken.access) : ""
  );
  const [invalidAccount, setInvalidAccount] = useState(false);
  const [verified, setVerified] = useState(
    localStorage.getItem("verified") && formData.password
      ? localStorage.getItem("verified")
      : false
  );

  const navigate = useNavigate();

  const loginUser = async (event) => {
    if (formData.username != "" && formData.password != "") {
      axiosInstance
        .post("api/token/", {
          username: formData.username,
          password: formData.password,
        })
        .then((response) => {
          setInvalidAccount(false);
          setFormData((prevData) => {
            return { ...prevData, email: "", username: "", password: "" };
          });

          if (response.status === 200) {
            localStorage.setItem("userToken", JSON.stringify(response.data));
            setUserToken(response.data);
            setUser(jwtDecode(response.data.access));

            if (response.data.email != "") navigate("/");
          } else {
            alert("something went wrong");
          }

          setFormData((previousState) => {
            return { ...previousState, username: "", password: "" };
          });
        })
        .catch((error) => {
          setFormData({ username: formData.username, password: "" });
          setInvalidAccount(true);

          console.log(error);
        });
    }
  };

  const logoutUser = async (event) => {
    setUserToken(null);
    setUser(null);

    localStorage.removeItem("userToken");
    localStorage.removeItem("authToken");
  };

  const getUserInfo = (data) => {
    axiosInstance
      .get("api-main/user/", {headers: data})
      .then((response) => {
        if (response.status === 200) {
        }
      })
  }

  const relogUser = (data) => {
    axiosInstance
      .post("api/token/", data)
      .then((response) => {
        if (response.status === 200) {
          localStorage.setItem("userToken", JSON.stringify(response.data));
          setUserToken(response.data);
          setUser(jwtDecode(response.data.access));
          setVerified(true);
          localStorage.setItem("verified", true);
        } else {
          alert("something went wrong");
        }
      })
      .catch((error) => {
        setFormData((prevData) => {
          return { ...prevData, password: "" };
        });

        console.log(error);
      });
  };

  const updateToken = () => {
    if (userToken != null) {
      axiosInstance
        .post(
          "api/token/refresh/",
          { refresh: userToken.refresh },
          {
            headers: {
              Authorization: `JWT ${userToken.access}`,
              "Content-Type": "application/json",
            },
          }
        )
        .then((response) => {
          if (response.status === 200) {
            localStorage.setItem("userToken", JSON.stringify(response.data));
            setUserToken(response.data);
            setUser(jwtDecode(response.data.access));
          }
        })
        .catch((error) => {
          console.log(error);
          logoutUser();
        });
    }

    setLoading(false);
  };

  const getUserFollowing = (username, page) => {
    axiosInstance
      .get(`api-main/userprofiles/${username}/following/?page=${page}`)
      .then((response) => {
        let userFollowingListUsername = [];

        setUserFollowingList((prevUsersFollowed) => {
          if (!prevUsersFollowed) return response.data.results;

          prevUsersFollowed.forEach((result) =>
            userFollowingListUsername.push(result)
          );

          response.data.results.forEach((result) => {
            if (!userFollowingListUsername.includes(result.username)) {
              prevUsersFollowed.push(result.username);
            }
          });

          return prevUsersFollowed;
        });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const getUserBlocked = (username, page) => {
    axiosInstance
      .get(`api-main/userprofiles/${username}/blocked/?page=${page}`)
      .then((response) => {
        setLoading(false);
        let userBlockedListUsername = [];

        setUserBlockedList((prevUsersBlocked) => {
          if (!prevUsersBlocked) return response.data.results;

          prevUsersBlocked.forEach((result) =>
            userBlockedListUsername.push(result)
          );

          response.data.results.forEach((result) => {
            if (!userBlockedListUsername.includes(result.username)) {
              prevUsersBlocked.push(result.username);
            }
          });

          return prevUsersBlocked;
        });
      })

      .catch((error) => {
        console.log(error);
      });
  };

  useLayoutEffect(() => {
    updateToken();
  }, []);

  useEffect(() => {
    if (userToken) {
      getUserFollowing(user.username, 1);
      getUserBlocked(user.username, 1);
    }
  }, []);
  useEffect(() => {
    let updateInterval = setInterval(() => {
      if (userToken) {
        updateToken();
      }
    }, 242000);
    return () => clearInterval(updateInterval);
  }, [userToken]);

  const value = {
    formData,
    setFormData,
    formError,
    setFormError,
    loginUser,
    logoutUser,
    relogUser,
    invalidAccount,
    updateToken,
    getUserInfo,
    user,
    userToken,
    setUser,
    setUserToken,
    navigate,
    getUserFollowing,
    getUserBlocked,
    userFollowingList,
    userBlockedList,
    setUserFollowingList,
    setUserBlockedList,
    verified,
    setVerified,
  };


  return (
    <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>
  );
}
