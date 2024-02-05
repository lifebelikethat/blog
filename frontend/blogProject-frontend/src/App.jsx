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
import { AuthProvider, useAuth } from "./contexts/AuthContext.jsx";
import ResetPassword from "./components/ResetPassword.jsx";
import ChangePassword from "./components/ChangePassword.jsx";
import ResetPasswordEmail from "./components/ResetPasswordEmail.jsx";
import PrivateRoute from "./utils/PrivateRoute.jsx";
import ReversePrivateRoute from "./utils/ReversePrivateRoute.jsx";
import ConfirmEmail from "./components/ConfirmEmail.jsx";
import UserProfile from "./components/UserProfile.jsx";
import ConfirmEmailLink from "./components/ConfirmEmailLink.jsx";
import Account from "./components/Account.jsx";
import AccountSettings from "./components/AccountSettings.jsx";

function App() {
  return (
    <>
      <Router>
        <AuthProvider>
          <Header />
          <Routes>
            <Route element={<ReversePrivateRoute />}>
              <Route
                exact
                path="reset-password/"
                element={<ResetPasswordEmail />}
              />
              <Route exact path="login/" element={<Login />} />

              <Route
                exact
                path="reset-password/:emailToken/"
                element={<ResetPassword />}
              />
              <Route exact path="register/" element={<Register />} />
            </Route>

            <Route element={<PrivateRoute />}>
              <Route
                exact
                path="account/:setting?/"
                element={<Account />}
              ></Route>

              <Route
                exact
                path="change-password/"
                element={<ChangePassword />}
              />
            </Route>

            <Route exact path="confirm/" element={<ConfirmEmail />} />
            <Route
              exact
              path="confirm/:emailToken/"
              element={<ConfirmEmailLink />}
            />

            <Route exact path="/" element={<Home />} />

            <Route exact path="/:username/" element={<UserProfile />} />

            <Route
              exact
              path="/:username/:status/"
              element={<Relationships />}
            />
          </Routes>
        </AuthProvider>
      </Router>
    </>
  );
}

export default App;

// import ListGroup from "./components/ListGroup.jsx";
// import StateTutorial from "./components/StateTutorial.jsx";

// function App() {
//   return (
//     <>
//       {/* <ListGroup /> */}
//       <StateTutorial />
//     </>
//   );
// }

// export default App;
