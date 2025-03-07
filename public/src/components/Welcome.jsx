import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Robot from "./robot.gif"; // Relative path if it's in the same folder


/*https://drive.google.com/file/d/1h5aKYR0-lBAoi8YTiUWS-Gyp9PQWmI91/view?usp=drive_link*/
// ✅ Use correct asset path for public folder


export default function Welcome() {
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const fetchUserName = async () => {
      const storedUser = localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY);
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUserName(userData.username || "User");
      }
    };

    fetchUserName();
  }, []);

  return (
    <Container>
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

  img {
    height: 20rem;
  }

  span {
    color: #4e0eff;
  }
`;

