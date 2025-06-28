import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { IoSettingsSharp } from "react-icons/io5";
import axios from "axios";
import { host } from "../utils/APIRoutes";

export default function UserOptionsDropdown({ socket }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      // Get current user from localStorage
      const currentUser = JSON.parse(localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY));
      
      if (currentUser && currentUser._id) {
        // Call logout endpoint to update user status
        await axios.get(`${host}/api/auth/logout/${currentUser._id}`);
      }
      
      // Disconnect socket if it exists
      if (socket?.current) {
        socket.current.disconnect();
      }
      
      // Clear localStorage and navigate
      localStorage.clear();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Even if logout fails, clear localStorage and navigate
      localStorage.clear();
      navigate("/login");
    }
  };

  const handleChangeAvatar = () => {
    navigate("/setAvatar");
  };

  return (
    <Container>
      <button onClick={() => setIsOpen(!isOpen)} className="dropdown-toggle">
        <IoSettingsSharp />
      </button>
      {isOpen && (
        <ul className="dropdown-menu">
          <li onClick={handleChangeAvatar}>Change Avatar</li>
          <li onClick={handleLogout}>Logout</li>
        </ul>
      )}
    </Container>
  );
}

const Container = styled.div`
  position: relative;
  .dropdown-toggle {
    background: none;
    border: none;
    color: #9a86f3;
    font-size: 1.5rem;
    cursor: pointer;
  }
  .dropdown-menu {
    position: absolute;
    top: 100%;
    right: 0;
    background-color: #131324;
    border: 1px solid #9a86f3;
    border-radius: 0.5rem;
    padding: 0.5rem;
    list-style: none;
    width: 150px;
    z-index: 10;
    li {
      padding: 0.75rem;
      color: white;
      cursor: pointer;
      &:hover {
        background-color: #9a86f3;
      }
    }
  }
`; 