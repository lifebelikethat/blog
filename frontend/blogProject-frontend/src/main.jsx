import React from "react";
import ReactDOM from "react-dom/client";
import Home from "./Home.jsx";
import Relationships from "./components/Relationships.jsx";
import "./index.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import Login from "./components/Login.jsx";
import Register from "./components/Register.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import ResetPassword from "./components/ResetPassword.jsx";
import ChangePassword from "./components/ChangePassword.jsx";
import ResetPasswordEmail from "./components/ResetPasswordEmail.jsx";
import PrivateRoute from "./utils/PrivateRoute.jsx";
import ReversePrivateRoute from "./utils/ReversePrivateRoute.jsx";
import ConfirmEmail from "./components/ConfirmEmail.jsx";
import UserProfile from "./components/UserProfile.jsx";
import ConfirmEmailLink from "./components/ConfirmEmailLink.jsx";
import App from "./App.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
