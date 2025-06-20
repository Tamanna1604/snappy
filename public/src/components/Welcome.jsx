import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Robot from "../assets/robot.gif";
import Logout from "./Logout";


/*https://drive.google.com/file/d/1h5aKYR0-lBAoi8YTiUWS-Gyp9PQWmI91/view?usp=drive_link*/
// ✅ Use correct asset path for public folder


export default function Welcome({ handleShowTopFriends }) {
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY);
    if (storedUser) {
      setUserName(JSON.parse(storedUser).username);
    }
  }, []);

  return (
    <Container>
      <div className="header">
        <div className="header-left">
          <button onClick={handleShowTopFriends} className="btn-secondary">
            Top Friends
          </button>
        </div>
        <div className="header-right">
          <button className="btn-secondary">Anonymous Message</button>
          <button className="btn-secondary">Game Mode</button>
          <Logout />
        </div>
      </div>
      <img src={Robot} alt="Welcome Bot" onError={(e) => console.error("Image failed to load:", e)} />
      <h1>
        Welcome, <span>{userName}!</span>
      </h1>
      <h3>Please select a chat to start messaging.</h3>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  flex-direction: column;
  position: relative;
  .header {
    position: absolute;
    top: 1rem;
    left: 1rem;
    right: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: calc(100% - 2rem);
  }
  .header-left, .header-right {
    display: flex;
    gap: 1rem;
    align-items: center;
  }
  .btn-secondary {
    background-color: #9a86f3;
    color: white;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    font-size: 1rem;
  }
  img {
    height: 20rem;
  }
  span {
    color: #4e0eff;
  }
`;

