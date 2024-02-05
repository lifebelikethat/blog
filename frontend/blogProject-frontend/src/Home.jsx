import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import "./Home.css";
import BlogList from "./components/BlogList";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { axiosInstance } from "./axios";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import {
  Icon,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Menu,
  MenuItem,
  Paper,
  Popper,
  ClickAwayListener,
  MenuList,
} from "@mui/material";

function Home() {
  const {
    userToken,
    user,
    navigate,
    updateToken,
    getUserFollowing,
    getUserBlocked,
  } = useAuth();
  const scrollRef = useRef();
  const [nextPageLoading, setNextPageLoading] = useState(true);
  const [bottomIsVisible, setBottomIsVisible] = useState(false);
  const [selected, setSelected] = useState(1);

  const [blogList, setBlogList] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadedBlogPages, setLoadedBlogPages] = useState([]);
  const [currentPage, setCurrentPage] = useState("api-main/blogs/");
  const [nextPage, setNextPage] = useState("");
  const [likeCount, setLikeCount] = useState({});

  // infinite scrolling
  const observer = useRef();
  const lastBlogElementRef = useCallback(
    (node) => {
      observer.current = new IntersectionObserver((entries) => {
	if (!loading) setBottomIsVisible(entries[0].isIntersecting);
      });

      if (node) {
        observer.current.observe(node);
      }
    },
    [blogList]
  );

  // get blogs
  const getBlogs = async (page) => {
    await axiosInstance
      .get(page, {
        headers: {
          "Content-Type": "application/json",
          Authorization: userToken ? `JWT ${userToken.access}` : null,
        },
      })
      .then((response) => {
        console.log('response')
        console.log(response)
        setNextPage((prevPage) => {
          setCurrentPage(page);

          return response.data.next
            ? response.data.next.replace("http://127.0.0.1/", "")
            : page;
        });
        setLoading(false);
        console.log("fetched from url", page);

        // pages loadeded
        setLoadedBlogPages((loadedPages) => {
          if (!loadedPages.includes(page)) {
            loadedPages.push(page);
          }

          return loadedPages;
        });

        // append new blogs to old blogs
        setBlogList((prevBlogList) => {
          let prevBlogListID = [];
          let prevBlogListTime = [];

          if (prevBlogList != "") {
            prevBlogList.map((blog) => {
              prevBlogListID.push(blog.id);
              prevBlogListTime.push(blog.item_since);
            });

            response.data.results.forEach((blog) => {
              // prevent duplicating blogs
              if (!prevBlogListID.includes(blog.id)) {
                prevBlogList.push(blog);
                prevBlogList;
              }

              // update time of blogs
              if (prevBlogListID.includes(blog.id)) {
                let index = prevBlogListID.indexOf(blog.id);
                prevBlogList[index].time_since = blog.time_since;
              }
            });

            prevBlogList.sort((a, b) => a.time_since - b.time_since);
          } else {
            return response.data.results.sort(
              (a, b) => a.time_since - b.time_since
            );
          }

          return [...prevBlogList];
        });
      })
      .catch((error) => {
        console.log(error);
        updateToken();
      });
  };

  useEffect(() => {
    if (nextPage) {
      getBlogs(nextPage);
    }
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
    if (nextPage) getBlogs(nextPage);
    console.log("bottom page");
  }, [bottomIsVisible]);

  useEffect(() => {
    // get blogs and liked posts on first refresh and api calls
    loadedBlogPages.length > 0
      ? loadedBlogPages.forEach((url) => {
          console.log(url);
          getBlogs(url);
        })
      : getBlogs(currentPage);

    // interval to fetch posts every 5 seconds
    // no need to getUserLiked() likes because we apply it onclick
    const fetchInterval = setInterval(() => {
      loadedBlogPages.length > 0
        ? loadedBlogPages.map((url) => {
            getBlogs(url);
          })
        : getBlogs(currentPage);
    }, 5000);

    return () => {
      clearInterval(fetchInterval);
    };
  }, [userToken, loadedBlogPages]);

  return (
    <div id="header">
      <div id="blog-container">
        {!loading ? (
          <div className="blogs-container">
            <button
              className={
                selected === 1 ? "top-buttons-selected" : "top-buttons"
              }
              onClick={() => {
                setBlogList([]);
                setSelected(1);
                setLoadedBlogPages([]);
                setCurrentPage("api-main/blogs/");
                setLoading(true);
                setNextPage(null);
                getBlogs("api-main/blogs/");
              }}
            >
              For you
            </button>

            {user ? (
              <button
                className={
                  selected === 2 ? "top-buttons-selected" : "top-buttons"
                }
                onClick={() => {
                  setBlogList([]);
                  setSelected(2);
                  setLoadedBlogPages([]);
                  setNextPage(null);
                  setCurrentPage("api-main/blogs/following/");
                  setLoading(true);
                  getBlogs("api-main/blogs/following/");
                }}
              >
                Following
              </button>
            ) : (
              <button
                className={
                  selected === 2 ? "top-buttons-selected" : "top-buttons"
                }
                onClick={() => navigate("/login")}
              >
                Following
              </button>
            )}
          </div>
        ) : null}
        {!loading ? (
          <BlogList blogList={blogList} likeCount={likeCount} />
        ) : null}

        <div
          style={{ height: "100vh" }}
          className="blogs-container"
          ref={lastBlogElementRef}
        ></div>
      </div>
    </div>
  );
}

export default Home;
