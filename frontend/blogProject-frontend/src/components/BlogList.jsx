import {
  Button,
  Popper,
  Paper,
  MenuList,
  MenuItem,
  ClickAwayListener,
  IconButton,
  Dialog,
  DialogContent,
  DialogActions,
} from "@mui/material";

import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";

import { axiosInstance } from "../axios";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

const BlogList = (props) => {
  const [blogList, setBlogList] = useState(props.blogList);
  const {
    user,
    userToken,
    navigate,
    userFollowingList,
    setUserFollowingList,
    userBlockedList,
    setUserBlockedList,
  } = useAuth();

  // user relationships

  const [liked, setLiked] = useState([0]);

  const [likeCount, setLikeCount] = useState([]);

  const initData = [
    {
      id: 1,
      imageURL: "./images/towa.jpg",
      croppedImageURL: null,
    },
  ];

  const [displayPicture, setDisplayPicture] = useState(initData);
  const [displayPictureClicked, setDisplayPictureClicked] = useState(false);

  // blog modals
  const [imageURL, setImageURL] = useState("");
  const [imageOpen, setImageOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [anchor, setAnchor] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  function getDate(currentDate, format) {
    let date = new Date(currentDate);

    date = date.toLocaleString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    if (format === "monthDate") {
      // e.g. Dec 17
      return date.slice(0, 6);
    } else if (format === "monthYear") {
      // e.g. Dec 2023
      return `${date.slice(0, 3)} ${date.slice(8, 12)}`;
    }

    return date;
  }

  const deleteBlogs = (blogID) => {
    let newArray = blogList.filter((blog) => {
      return blog.id != blogID;
    });

    setBlogList(() => {
      return [...newArray];
    });

    axiosInstance
      .delete(`api-main/blogs/${blogID}/`, {
        headers: {
          Authorization: userToken ? `JWT ${userToken.access}` : null,
        },
      })
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  // setLiked([array of blog_id of liked posts by logged in user])
  // http://127.0.0.1:8000/api-main/users/<username>/

  const getUserLiked = () => {
    if (user) {
      axiosInstance
        .get(`api-main/userprofiles/${user.username}/`, {
          headers: { "Content-Type": "application-json" },
        })
        .then((response) => {
          setLiked(response.data.liked_blogs);
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      setLiked(
        localStorage.getItem("liked_blogs")
          ? localStorage.getItem("liked_blogs")
          : liked
      );
    }
  };

  const handleDeleteClose = () => {
    setDeleteOpen(false);
  };

  const sendLikePut = (followList) => {
    axiosInstance
      .put(
        `api-main/users/${user.username}/`,
        {
          liked_blogs: followList,
        },
        { headers: { "Authorization": `JWT ${userToken.access}` } }
      )
      .catch((error) => {
        console.log(error);
      });
  };

  // setLiked(append blog_id to array)
  const handleLike = (blog_id) => {
    setLiked([...liked, blog_id]);
    setLikeCount({ ...likeCount, [blog_id]: likeCount[blog_id] + 1 });

    // for sending put request to like
    if (user) {
      const getUserLikedPosts = () => {
        axiosInstance
          .get(`api-main/users/${user.username}/`, {
            headers: { "Content-Type": "application-json" },
          })
          .then((response) => {
            response.data.liked_blogs.push(blog_id);

            sendLikePut(response.data.liked_blogs);
          })
          .catch((error) => {
            console.log(error);
          });
      };

      getUserLikedPosts(user.username);
    } else {
      let old_likes = [];
      old_likes.push(localStorage.getItem("liked_blogs"));
      old_likes.push(blog_id);
      localStorage.setItem("liked_blogs", old_likes);
    }
  };

  // setLiked(remove blog_id from array)
  const handleDislike = (blog_id) => {
    setLiked(liked.filter((like) => like != blog_id));
    setLikeCount({ ...likeCount, [blog_id]: likeCount[blog_id] - 1 });

    // for sending put request to unlike
    if (user) {
      const getUserLikedPosts = () => {
        axiosInstance
          .get(`api-main/users/${user.username}/`, {
            headers: {
              "Content-Type": "application-json",
              Authorization: `JWT ${userToken.access}`,
            },
          })
          .then((response) => {
            let index = response.data.liked_blogs.indexOf(blog_id);
            response.data.liked_blogs.splice(index);

            sendLikePut(response.data.liked_blogs);
          })
          .catch((error) => {
            console.log(error);
          });
      };

      getUserLikedPosts(user.username);
    } else {
      let old_likes = [];
      let index = liked.indexOf(blog_id);
      old_likes.push(localStorage.getItem("liked_blogs"));
      old_likes.splice(index);
      localStorage.setItem("liked_blogs", old_likes);
    }
  };

  const addRelationship = (username, status) => {
    if (status === 1)
      setUserFollowingList((users) => {
        users.push(anchor.name);
        return users;
      });
    else if (status === 2)
      setUserBlockedList((users) => {
        users.push(anchor.name);
        return users;
      });

    axiosInstance
      .post(
        "api-main/relationships/",
        { from_person: user.username, to_person: username, status: status },
        { headers: { Authorization: `JWT ${userToken.access}` } }
      )
      .then(() => {
        if (status === 1) console.log("followed");
        else if (status === 2) console.log("blocked");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const editRelationship = (username, status) => {
    axiosInstance
      .put(
        `api-main/relationships/${user.username}/${username}/`,
        { status: status },
        { headers: { Authorization: `JWT ${userToken.access}` } }
      )
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const deleteRelationship = (username, func = null, status = null) => {
    if (status === 1)
      setUserFollowingList((users) => {
        let index = users.indexOf(username);
        users.splice(index, 1);

        return users;
      });
    else if (status === 2)
      setUserBlockedList((users) => {
        let index = users.indexOf(username);
        users.splice(index, 1);

        return users;
      });
    axiosInstance
      .delete(`api-main/relationships/${user.username}/${username}/`, {
        headers: { Authorization: `JWT ${userToken.access}` },
      })
      .then((response) => {
        console.log("deleted relationship");
        if (func && status) func(username, status);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleFollow = (username) => {
    if (userBlockedList.includes(username)) {
      editRelationship(username, 1);
      setUserFollowingList((users) => {
        users.push(anchor.name);
        return users;
      });
      return;
    }
    addRelationship(username, 1);
  };

  const handleUnfollow = (username) => {
    deleteRelationship(username, null, 1);
  };

  const handleBlock = (username) => {
    if (userFollowingList.includes(username)) {
      editRelationship(username, 2);
      setUserBlockedList((users) => {
        users.push(anchor.name);
        return users;
      });
      return;
    }

    addRelationship(username, 2);
  };

  useEffect(() => {
    if (user) {
      getUserLiked();
    }

    // number of blog likes
  }, []);

  const handlePictureClick = () => {
    setDisplayPictureClicked(!displayPictureClicked);
  };

  console.log(displayPicture);

  useEffect(() => {
    if (userBlockedList != "") setLoading(false);
  }, [userBlockedList]);

  useEffect(() => {
    blogList.forEach((blog) => {
      setLikeCount((prevLikes) => {
        return { ...prevLikes, [blog.id]: blog.likes.length };
      });
    });
  }, [blogList]);

  return (
    <>
      {/* view image modal */}
      <Dialog
      fullScreen
      onClick={() => setImageOpen(false)}
      PaperProps={{
          style: { borderRadius: 0, backgroundColor: "transparent" },
      }}
      sx={{
          position: "fixed",
              padding: "0px",
              height: window.innerHeight + "px",
              width: window.innerWidth + "px",
      }}
      open={imageOpen}
      onClose={() => setImageOpen(false)}
      >
      <img
      src={imageURL}
      style={{
          position: "relative",
              overflow: "hidden !important",
              maxWidth: "75%",
              maxHeight: "75%",
              overflowY: "hidden",
              objectFit: "contain",
              margin: "auto",
              opacity: 1,
      }}
      />
      </Dialog>

      {/* delete blog modal */}
      <Dialog
        PaperProps={{ style: { borderRadius: 0 } }}
        sx={{
          overflow: "hidden !important",
          position: "fixed",
          padding: 0,
        }}
        open={deleteOpen}
        onClose={() => setDeleteOpen(true)}
      >
        <DialogContent
          id="dialog-description"
          sx={{
            overflow: "hidden !important",
          }}
        >
          Are you sure you want to delete this post?
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => {
              setDeleteOpen(false);
              deleteBlogs(anchor.getAttribute("blogid"));
            }}
          >
            Yes
          </Button>
          <Button onClick={handleDeleteClose}>No</Button>
        </DialogActions>
      </Dialog>
      {/* blog options dropdown */}
      <Popper id="dropdown" anchorEl={anchor} open={open} placement="bottom">
        {/* delete or unfollow post */}
        <Paper>
          <ClickAwayListener onClickAway={handleToggle}>
            <MenuList>
              {user ? (
                <MenuItem
                  // follow / unfollow / delete post
                  onClick={() => {
                    handleToggle();
                    if (anchor) {
                      if (anchor.name === user.username) {
                        setDeleteOpen(true);
                        return;
                      }

                      // if already followed, unfollow
                      if (userFollowingList.includes(anchor.name)) {
                        handleUnfollow(anchor.name);
                        console.log("handleUnfollow");
                      } else {
                        console.log("handleFollow");
                        handleFollow(anchor.name);
                      }
                    }
                  }}
                >
                  {anchor
                    ? anchor.name === user.username
                      ? `Delete post`
                      : userFollowingList
                      ? userFollowingList.includes(anchor.name)
                        ? `Unfollow ${anchor.name}`
                        : `Follow ${anchor.name}`
                      : `Follow ${anchor.name}`
                    : null}
                </MenuItem>
              ) : (
                <MenuItem
                  onClick={() => {
                    navigate("/login");
                  }}
                >
                  {anchor ? `Follow ${anchor.name}` : null}
                </MenuItem>
              )}
              {user && anchor ? (
                user.username != anchor.name ? (
                  <MenuItem
                    onClick={() => {
                      handleToggle();
                      handleBlock(anchor.name);
                    }}
                  >
                    Block
                  </MenuItem>
                ) : null
              ) : (
                <MenuItem>Block</MenuItem>
              )}
            </MenuList>
          </ClickAwayListener>
        </Paper>
      </Popper>

      {blogList.map((blog) =>
        userBlockedList ? (
          !userBlockedList.includes(blog.author.username) && !loading ? (
            <div key={blog.id} border="true" className="blogs-container">
              {/* blog options dropdown button */}

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

              {/* blog author small-link */}
              <small
                className="small-link"
                onClick={() => {
                  navigate(`/${blog.author.username}`);
                }}
              >
                <b>@{blog.author.username}</b>
              </small>

              {/* whitespaces */}
              {"\u00A0"}
              {"\u00A0"}

              {/* blog time since posted */}
              {blog.created.slice(0, 4) !=
              new Date().getFullYear() ? null : blog.time_since > 86399 ? (
                <>
                  {/* shows month and date, e.g. Dec 17 */}
                  <small>{getDate(blog.created, "monthDate")}</small>
                </>
              ) : blog.time_since < 3600 ? (
                <small>{Math.floor(blog.time_since / 60)}m</small>
              ) : (
                <small>{Math.floor(blog.time_since / 3600)}h</small>
              )}
              <p>{blog.content}</p>
              <img
                onClick={() => {
                  document.body.style.overflowY = "enabled";
                  setImageURL(blog.image);
                  setImageOpen(true);
                }}
                src={
                  blog.image === "http://127.0.0.1:8000/media/posts/default.jpg"
                    ? null
                    : blog.image
                }
              />

              {liked.indexOf(blog.id) != -1 ? (
                <IconButton
                  onClick={() => {
                    handleDislike(blog.id);
                  }}
                >
                  <FavoriteIcon />
                </IconButton>
              ) : (
                <IconButton
                  onClick={() => {
                    setLiked([...liked, blog.id]);
                    handleLike(blog.id);
                  }}
                >
                  <FavoriteBorderIcon />
                </IconButton>
              )}
              {likeCount[blog.id]}
            </div>
          ) : null
        ) : null
      )}
    </>
  );
  // return (
  //   <div className="blogs-container">
  //     {displayPicture.map((pictureObj) => {
  //       return <img src={pictureObj.imageURL} onClick={handlePictureClick} />;
  //     })}
  //   </div>
  // );
};

export default BlogList;
