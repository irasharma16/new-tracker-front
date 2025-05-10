import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Dropdown from "../Header/Dropdown";
import Header from "../Header/Header";
import '../Header/Header.css';

const sidebarItems = [
  { name: "Home", items: [], type: "button" },
  { name: "Graphs", items: [], type: "button" },
  { name: "Masters", items: ["Client", "Issue Type", "Module", "Phase", "Processes", "Level", "Priority", "Resolution Type", "Team", "Status", "Employee", "Size"], type: "dropdown" },
  { name: "Transactions", items: ["Register Issue", "Client Visit", "Time Sheet"], type: "dropdown" },
  { name: "Project", items: ["Add Project"], type: "dropdown" },
  { name: "Reports", items: ["Issues Details", "Userwise Issues", "Client Visit"], type: "dropdown" },
  { name: "Edit Profile", items: [], type: "button" },
  { name: "Security", items: [], type: "button" },
];

function LayoutWithHeader() {
  const [loggedInUser, setLoggedInUser] = useState("");
  const [userRole, setUserRole] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoggedInUser(localStorage.getItem("loggedInUser"));
    const role = localStorage.getItem("userRole");
    console.log("User Role:", role); // Log for debugging
    setUserRole(role);
  }, []);

  const handleButtonClick = (name) => {
    if (name === "Home") {
      navigate("/home");
    } else if (name === "Security") {
      navigate("/userlists");
    } else if (name === "Graphs") {
      navigate("/graph");
    } else if (name === "Edit Profile") {
      navigate("/edit-profile");
    }
  };

  const toggleDropdown = (index) => {
    setOpenDropdown(openDropdown === index ? null : index);
  };

  const normalizedRole = userRole ? userRole.toLowerCase() : "";
  const filterSidebarItems = (items) => {
    let filteredItems;
    if (normalizedRole === "admin") {
      filteredItems = items;
    } else if (normalizedRole === "user") {
      filteredItems = items.filter(item => {
        if (item.name === "Transactions") {
          item.items = item.items.filter(subItem => 
            ["Register Issue", "Client Visit", "Time Sheet"].includes(subItem)
          );
        }
        return item.name !== "Security" && item.name !== "Masters";
      });
    } else if (normalizedRole === "client") {
      filteredItems = items.filter(item => {
        if (item.name === "Transactions") {
          item.items = item.items.filter(subItem => 
            ["Register Issue"].includes(subItem)
          );
        }
        if (item.name === "Reports") {
          item.items = item.items.filter(subItem =>
            ["Issues Details"].includes(subItem)
          );
          return true; 
        }
        return ["Home", "Graphs", "Edit Profile", "Transactions", "Reports"].includes(item.name);
      });
    } else if (normalizedRole === "visitor") {
      filteredItems = items.filter(item => ["Home", "Graphs", "Edit Profile"].includes(item.name));
    } else {
      filteredItems = [];
    }
    
    return filteredItems;
  };

  return (
    <div className="layout-container">
      <Header />
      <div className="content-wrapper">
        <aside className="sidebar">
          {filterSidebarItems(sidebarItems).map((item, index) => (
            item.type === "button" ? (
              <button
                key={index}
                className="sidebar-button"
                onClick={() => handleButtonClick(item.name)}
              >
                {item.icon && <img src={item.icon} alt={`${item.name} icon`} className="sidebar-icon" />}
                {item.name}
              </button>
            ) : (
              <Dropdown
                key={index}
                name={item.name}
                items={item.items}
                isOpen={openDropdown === index}
                toggleDropdown={() => toggleDropdown(index)}
              />
            )
          ))}
        </aside>
        <main className="main-content">
          <Outlet />
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}

export default LayoutWithHeader;