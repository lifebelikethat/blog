import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import "../Home.css";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { axiosInstance } from "../axios";
import { useParams } from "react-router-dom";
import { Button } from "@mui/material";

function Relationships() {
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [userList, setUserList] = useState([]);
  const [currentuserFollowingList, setCurrentUserFollowingList] = useState([]);
  const [currentUserFollowerList, setCurrentUserFollowerList] = useState([]);
  const [currentUserBlockedList, setCurrentUserBlockedList] = useState([]);
  const [loading, setLoading] = useState(true);
  const { navigate, user, userToken } = useAuth();
  const urlUsername = useParams().username;
  const urlStatus = useParams().status;
  const [selected, setSelected] = useState(
    urlStatus === "following" ? 1 : urlStatus === "followers" ? 2 : null
  );

  const [followButton, setFollowButton] = useState([]);
  const handleFollow = (event) => {
    event.preventDefault();
    if (!followButton.includes(event.target.value)) {
      follow(user.username, event.target.value);
    } else {
      deleteRelationship(user.username, event.target.value);
    }
  };

  const follow = (from, to) => {
    axiosInstance
      .post(
        `api-main/relationships/`,
        {
          status: 1,
          from_person: from,
          to_person: to,
        },
        {
          headers: {
            Authorization: user ? `JWT ${userToken.access}` : null,
          },
        }
      )
      .then((response) => {
        setFollowButton((prev) => {
          return [...prev, to];
        });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const deleteRelationship = (from, to) => {
    axiosInstance
      .delete(`api-main/relationships/${from}/${to}/`, {
        headers: {
          Authorization: user ? `JWT ${userToken.access}` : null,
        },
      })
      .then((response) => {
        setFollowButton((prev) => {
          return prev.filter((userStr) => userStr != to);
        });
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const getUserFollowing = (username) => {
    axiosInstance
      .get(`api-main/userprofiles/${username}/following/`)
      .then((response) => {
        setLoading(false);
        // if not logged in
        if (!user) {
          setUserList(response.data.results)
        }

        // if viewing your own user profile
        else if (urlUsername === user.username) {
          setUserList(response.data.results);
          setCurrentUserFollowingList(response.data.results);
        }

        // if viewing a different user profile
        else if (username != user.username && urlUsername != user.username) {
          setUserList(response.data.results);
          getUserFollowing(user.username);
        }  {
          setCurrentUserFollowingList(response.data.results);
          response.data.results.map((userResult) => {
            setFollowButton((prev) => {
              if (prev) {
                if (prev.includes(userResult.username)) return prev;

                return [...prev, userResult.username];
              }

              return [userResult.username];
            });
          });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const getUserFollowers = (username) => {
    axiosInstance
      .get(`api-main/userprofiles/${username}/followers/`)
      .then((response) => {
        setUserList(response.data.results);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const getUserBlocked = (username) => {
    axiosInstance
      .get(`api-main/userprofiles/${username}/blocked/`)
      .then((response) => {
        setCurrentUserBlockedList(response.data.results);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    if (user) {
      getUserFollowing(user.username);
      getUserBlocked(user.username);
    }

    selected === 1
      ? getUserFollowing(urlUsername)
      : getUserFollowers(urlUsername);

    const fetchInterval = setInterval(() => {
      selected === 2
        ? getUserFollowers(urlUsername)
        : getUserFollowing(urlUsername);
    }, 10000);

    return () => clearInterval(fetchInterval);
  }, [followerCount, followingCount, selected]);

  return (
    <>
      <div style={{ margin: 0 + "px", padding: "0px" }} id="blog-container">
        {!loading ? (
          <div className="blogs-container">
            <button
              className={
                urlStatus === "following"
                  ? "top-buttons-selected"
                  : "top-buttons"
              }
              onClick={() => {
                setSelected(1);
                setUserList([]);
                navigate(`/${urlUsername}/following/`);
                getUserFollowing(urlUsername);
              }}
            >
              Following
            </button>

            <button
              className={
                urlStatus === "followers"
                  ? "top-buttons-selected"
                  : "top-buttons"
              }
              onClick={() => {
                setSelected(2);
                setUserList([]);
                navigate(`/${urlUsername}/followers/`);
                getUserFollowers(urlUsername);
              }}
            >
              Followers
            </button>
          </div>
        ) : null}

        {loading
          ? null
          : userList.map((userListUser, index) => {
              return (
                <div
                  key={userListUser.id}
                  className="blogs-container followingFollowers"
                  style={{ height: "50px" }}
                  onClick={(event) => {
                    if (event.target.name === "button") {
                      user ? handleFollow(event) : null;
                      return;
                    }

                    navigate(`${userListUser.username}`);
                  }}
                >
                  {userListUser.username != user.username ? (
                    <Button
                      variant="outlined"
                      sx={{ my: 1.5, mx: 1.5 }}
                      style={{
                        borderRadius: "25px",
                        marginRight: "0px",
                        marginTop: "2px",
                        marginBottom: 0,
                        padding: 0,
                        float: "right",
                      }}
                      name="button"
                      value={userListUser.username}
                      className="btn-modal"
                      disableElevation={true}
                    >
                      {followButton.includes(userListUser.username)
                        ? "following"
                        : "follow"}
                    </Button>
                  ) : null}
                  <small className="small-link">@{userListUser.username}</small>
                </div>
              );
            })}

        <div className="blogs-container"></div>
      </div>
    </>
  );
}

export default Relationships;
