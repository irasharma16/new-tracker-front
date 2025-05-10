import React from "react";
import { useNavigate } from "react-router-dom";

function Dropdown({ name, items, isOpen, toggleDropdown }) {
  const navigate = useNavigate();

  const handleClick = (item) => {
    let path = "";
    switch (item) {
      case "Client":
        path = "/client";
        break;
      case "Issue Type":
        path = "/issueType";
        break;
      case "Module":
        path = "/module";
        break;
      case "Phase":
        path = "/phase";
        break;
      case "Processes":
        path = "/process";
        break;
      case "Level":
        path = "/level";
        break;
      case "Priority":
        path = "/priority";
        break;
      case "Resolution Type":
        path = "/resolutionType";
        break;
      case "Team":
        path = "/team";
        break;
      case "Status":
        path = "/status";
        break;
      case "Employee":
        path = "/employee";
        break;
      case "Size":
        path = "/sizeMaster";
        break;
      case "Register Issue":
        path = "/registerIssue";
        break;
      case "Client Visit":
        path = "/clientvisit";
        break;
      case "Time Sheet":
        path = "/timesheet";
        break;
      case "Add Project":
        path = "/projects";
        break;
      case "Existing Projects":
        path = "/existingProject";
        break;
      case "Issues Details":
        path = "/issuedetails";
        break;
      case "Userwise Issues":
        path = "/userwiseissues";
        break;
      
      default:
        break;
    }
    navigate(path);
    toggleDropdown();
  };

  return (
    <div className={`dropdown ${isOpen ? "open" : ""}`}>
      <button onClick={toggleDropdown} className="dropdown-toggle">
        {name}
        <span className="dropdown-arrow">▼</span>
      </button>
      {isOpen && (
        <ul className="dropdown-menu">
          {items.map((item, index) => (
            <li key={index}>
<button
  type="button"
  className="dropdown-item"
  onClick={() => handleClick(item)}
>
  {item}
</button>

            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Dropdown;