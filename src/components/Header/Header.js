import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { handleSuccess } from "../../utils";
import "./Header.css";
import home from "./home.svg";
import logo from "./logo.jpg";
import log from "./logoff.svg";
import profile from "./profile.png";

function Header() {
  const [loggedInUser, setLoggedInUser] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    setLoggedInUser(localStorage.getItem("loggedInUser"));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("loggedInUser");
    handleSuccess("User Logged out");
    setTimeout(() => {
      navigate("/login", { replace: true });
      window.location.reload();
    }, 1000);
  };

  return (
    <div className="layout-container">
      <header className="top-header">
        <div className="logo-container">
          <img src={logo} alt="Logo" className="logo-image" onClick={() => navigate("/home")} />
        </div>

        <div className="header-buttons">
          <button onClick={() => navigate("/home")} className="icon">
            <img src={home} alt="Home" className="interface" />
          </button>
          <button onClick={handleLogout} className="icon">
            <img src={log} alt="Logout" className="logoff" />
          </button>
          <button onClick={() => navigate("/edit-profile")} className="icon">
  <img src={profile} alt="Profile" className="profile-icon" />
</button>
        </div>
      </header>
      <ToastContainer />
    </div>
  );
}


export default Header;
