import { useState, useRef, useCallback } from "react";
import { axiosInstance } from "../axios";
import { useAuth } from "../contexts/AuthContext";
import { useParams, NavLink } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@mui/material";

import {
  Popper,
  MenuList,
  MenuItem,
  Paper,
  ClickAwayListener,
} from "@mui/material";

import "../Home.css";
import "./UserProfile.css";
import BlogList from "./BlogList";

export default function UserProfile() {
  const [loading, setLoading] = useState(true);
  const { user, userToken, navigate } = useAuth();
  const [selected, setSelected] = useState(
    localStorage.getItem("selected")
      ? parseInt(localStorage.getItem("selected"))
      : 1
  );
  const [blogList, setBlogList] = useState("");
  const [userFollowingList, setUserFollowingList] = useState([]);
  const [loadedBlogPages, setLoadedBlogPages] = useState(["page=1"]);
  const [currentPage, setCurrentPage] = useState("page=1");
  const [nextPage, setNextPage] = useState("page=2");
  const [bottomVisible, setBottomVisible] = useState("false");
  const [followingCount, setFollowingCount] = useState(0);
  const [followerCount, setFollowerCount] = useState(0);
  const urlUsername = useParams().username;

  const [anchor, setAnchor] = useState(null);
  const [open, setOpen] = useState(false);
  // true = following  false = not following
  const [followButtonText, setFollowButtonText] = useState(false);
  // infinite scrolling
  const observer = useRef();
  const lastBlogElementRef = useCallback(
    (node) => {
      if (loading) return;

      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setBottomVisible(entries[0].isIntersecting);

          getBlogs(nextPage);
        }
      });

      if (node) {
        observer.current.observe(node);
      }
    },
    [loading, blogList]
  );

  const getBlogs = async (username, page) => {
    axiosInstance
      .get(`api-main/blogs/author%3D${username}/?${page}`, {
        headers: { "content-type": "application/json" },
      })
      .then((response) => {
        if (response.data.results.length > 0) {
          setLoading(false)
        }
        setCurrentPage(nextPage);
        if (response.data.results == []) return null;

        response.data.next
          ? loadedBlogPages.push(response.data.next.slice(-6))
          : null;

        setNextPage((oldNextPage) => {
          return response.data.next
            ? response.data.next.slice(-6)
            : oldNextPage;
        });
        setBlogList((prevBlogList) => {
          if (prevBlogList.length > 0) {
            let prevBlogListID = [];

            prevBlogList.forEach((blog) => {
              prevBlogListID.push(blog.id);
            });

            response.data.results.forEach((blog) => {
              if (!prevBlogListID.includes(blog.id)) {
                prevBlogList.push(blog);
              }
            });

            prevBlogList.sort((a, b) => a.time_since - b.time_since);
            return prevBlogList;
          } else {
            return response.data.results.sort(
              (a, b) => a.time_since - b.time_since
            );
          }
        });
      })

      .catch((error) => {
        console.log(error);
      });
  };

  const handleFollow = () => {
    setFollowButtonText(!followButtonText);

    console.log(user)

    // followButtonText = true => following
    if (followButtonText) {
      setFollowerCount((prevFollowerCount) => prevFollowerCount - 1);
      deleteRelationship();
    } else {
      setFollowerCount((prevFollowerCount) => prevFollowerCount + 1);
      follow();
    }
  };

  const follow = () => {
    axiosInstance
      .post(
        "api-main/relationships/",
        { from_person: user.username, to_person: urlUsername, status: 1 },
        { headers: { Authorization: `JWT ${userToken.access}` } }
      )
      .then((response) => {
        console.log(response);
        console.log("followed");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const deleteRelationship = () => {
    axiosInstance
      .delete(`api-main/relationships/${user.username}/${urlUsername}/`, {
        headers: { Authorization: `JWT ${userToken.access}` },
      })
      .then((response) => {
        console.log(response);
        console.log("deleted relationship");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const getUserFollowing = (username, page) => {
    axiosInstance
      .get(`api-main/userprofiles/${username}/following/?page=${page}`)
      .then((response) => {
        if (username === user.username) {
          setUserFollowingList((prev) => {
            if (prev) {
              response.data.results.map((res) => {
                return [...prev, res];
              });
            }

            return response.data.results;
          });

          // if next page exists => add to current user following list
          if (response.data.next) {
            getUserFollowing(username, page + 1);
          } else {
            if (urlUsername === username) {
              setFollowingCount((prev) => {
                if (prev != 0) return prev + response.data.results.length;

                return response.data.results.length;
              });
            }
          }
        } else if (username === urlUsername) {
          if (response.data.next) {
            getUserFollowing(username, page + 1);
          } else {
            setFollowingCount((prev) => {
              if (prev != 0) return prev + response.data.results.length;
              else return response.data.results.length;
            });
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const getUserFollowers = (username, page) => {
    axiosInstance
      .get(`api-main/userprofiles/${username}/followers/?page=${page}`)
      .then((response) => {
        if (username === user.username) {
          if (response.data.next) {
            getUserFollowers(username, page + 1);
          } else {
            setFollowerCount((prev) => {
              if (prev != 0) return prev + response.data.results.length;

              return response.data.results.length;
            });
          }
        } else if (urlUsername === username) {
          if (response.data.next) {
            getUserFollowers(username, page + 1);
          } else {
            setFollowerCount((prev) => {
              if (prev != 0) return prev + response.data.results.length;

              return response.data.results.length;
            });
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handlePopperToggle = () => {
    setOpen(!open);
  };

  const handleRedirect = () => {
    if (!user) navigate("/login");
    return;
  }

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });

    if (nextPage) {
      getBlogs(nextPage);
    }

    getUserFollowers(urlUsername, 1);
    getUserFollowing(urlUsername, 1);
  }, []);

  useEffect(() => {
    let scrollHeight =
      document.getElementById("blog-container").scrollHeight +
      document.getElementById("header").scrollHeight;

    if (scrollHeight <= window.innerHeight && !loading) {
      getBlogs(nextPage);
    }
  }, [blogList]);

  useEffect(() => {
    if (userFollowingList.find((key) => key.username === urlUsername)) {
      setFollowButtonText(true);
    }
  }, [userFollowingList]);

  useEffect(() => {
    loadedBlogPages.forEach((page) => {
      getBlogs(urlUsername, page);
    });

    const fetchInterval = setInterval(() => {
      loadedBlogPages.forEach((page) => {
        getBlogs(urlUsername, page);
      });
    }, 5000);

    return () => clearInterval(fetchInterval);
  }, [userToken, bottomVisible, followButtonText]);

  return (
    <>
      <Popper id="dropdown" anchorEl={anchor} open={open}>
        <Paper>
          <ClickAwayListener onClickAway={() => setOpen(false)}>
            <MenuList>
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
                  setOpen(false);
                  navigate("/change-password");
                }}
              >
                Change Password
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setOpen(false);
                  logoutUser();
                }}
              >
                Logout
              </MenuItem>
            </MenuList>
          </ClickAwayListener>
        </Paper>
      </Popper>

      <div style={{ marginTop: "-20px", padding: "0px" }} id="blog-container">
        <div
          className="blogs-container user-profile-header"
          style={{ borderBottom: "1px solid lightgrey" }}
        >
          <h2
            style={{
              marginBottom: "10px",
            }}
          >
            {urlUsername}
          </h2>
          {user && user.username != urlUsername ? (
            <Button
              variant="outlined"
              sx={{ my: 1.5, mx: 1.5 }}
              style={{
                borderRadius: "25px",
                marginRight: "0px",
                marginTop: "-14px",
                padding: "5px",
                float: "right",
              }}
              onClick={handleFollow}
              className="btn-modal"
              disableElevation={true}
            >
              {followButtonText ? "following" : "follow"}
            </Button>
          ) : !user ? (
            <Button
              variant="outlined"
              sx={{ my: 1.5, mx: 1.5 }}
              style={{
                borderRadius: "25px",
                marginRight: "0px",
                marginTop: "-14px",
                padding: "5px",
                float: "right",
              }}
              className="btn-modal"
              disableElevation={true}
              onClick={() => {
                navigate('/login')
              }}
            >
              follow
            </Button>
          ) : null}
          <small
            className="small-link"
            onClick={() => {
              if (!user) handleRedirect();
              else navigate(`/${urlUsername}/following/`);
            }}
          >
            <b>{followingCount}</b> Following
          </small>

          <small
            className="small-link"
            onClick={() => {
              if (!user) handleRedirect();
              else navigate(`/${urlUsername}/followers/`);
            }}
            style={{ marginLeft: "20px" }}
          >
            <b>{followerCount}</b> Followers
          </small>
        </div>

        {loading ? null: <BlogList blogList={blogList} />}

        {/* {!loading ? (
          blogList.map((blog, index) => {
            return (
              <div key={blog.id} border="true" className="blogs-container">
                <h5
                  style={{ fontWeight: 700, display: "inline" }}
                  className="author-link"
                  onClick={() => {
                    navigate(`/${blog.author.username}`);
                  }}
                >
                  @{blog.author.username}
                </h5>
                {"\u00A0"}
                {"\u00A0"}
                {blog.time_since > 86399 ? (
                  <>
                    <small>{blog.created.slice(0, 10)}</small>
                  </>
                ) : blog.time_since < 3600 ? (
                  <small>{Math.floor(blog.time_since / 60)}m</small>
                ) : (
                  <small>{Math.floor(blog.time_since / 3600)}h</small>
                )}

                <Button
                  sx={{ my: 1, mx: 1.5, ":hover": { bgcolor: "inherit" } }}
                  id="dropdown"
                  aria-controls={open ? dropdown : null}
                  aria-haspopup="true"
                  aria-expanded={open ? "true" : null}
                  style={{
                    color: "black",
                    float: "right",
                    marginTop: 0,
                    maxHeight: "30px",
                    maxWidth: "30px",
                    minHeight: "0px",
                    minWidth: "0px",
                    borderRadius: "100px",
                  }}
                  name={`${blog.author.username}`}
                  blogid={blog.id}
                  onClick={(event) => {
                    setAnchor(event.target);

                    setOpen(true);
                  }}
                >
                  ...
                </Button>

                <p>{blog.content}</p>
                <img
                  src={
                    blog.image ===
                    "http://127.0.0.1:8000/media/posts/default.jpg"
                      ? null
                      : blog.image
                  }
                />
              </div>
            );
          })
        ) : (
          <p>loading</p>
        )} */}
        <div
          style={{ height: "100vh" }}
          className="blogs-container"
          ref={lastBlogElementRef}
        ></div>
      </div>
    </>
  );
}
