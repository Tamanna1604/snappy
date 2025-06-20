import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { IoSettingsSharp } from "react-icons/io5";

export default function UserOptionsDropdown() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
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