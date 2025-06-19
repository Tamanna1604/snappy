import React, { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { setAvatarRoute } from "../utils/APIRoutes";


// ✅ Updated paths for static assets (Stored inside `public/assets/`)
const Loader = "/assets/loader.gif";
const Logo = "/assets/logo.svg";
const Robot = "/assets/robot.gif";

export default function SetAvatar() {
  const navigate = useNavigate();
  const [avatars, setAvatars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAvatar, setSelectedAvatar] = useState(undefined);

  const toastOptions = {
    position: "bottom-right",
    autoClose: 8000,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
  };

  useEffect(() => {
    const storedUser = localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY);
    if (!storedUser) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    // ✅ Using high-quality avatars
    const avatarArray = [
      "https://api.dicebear.com/7.x/adventurer/svg?seed=avatar1",
      "https://api.dicebear.com/7.x/adventurer/svg?seed=avatar2",
      "https://api.dicebear.com/7.x/adventurer/svg?seed=avatar3",
      "https://api.dicebear.com/7.x/adventurer/svg?seed=avatar4"
    ];
    
    setAvatars(avatarArray);
    setIsLoading(false);
  }, []);

  const setProfilePicture = async () => {
    if (selectedAvatar === undefined) {
      toast.error("Please select an avatar", toastOptions);
      return;
    }

    const storedUser = localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY);
    if (!storedUser) {
      toast.error("User not found, please log in again.", toastOptions);
      navigate("/login");
      return;
    }

    const user = JSON.parse(storedUser);
    console.log("User ID:", user._id);
    console.log("Sending request to:", `${setAvatarRoute}/${user._id}`);
    console.log("Payload:", { image: avatars[selectedAvatar] });

    try {
      const { data } = await axios.post(`${setAvatarRoute}/${user._id}`, {
        image: avatars[selectedAvatar],
      });

      console.log("API Response:", data);

      if (data.isSet) {
        user.isAvatarImageSet = true;
        user.avatarImage = data.image;
        localStorage.setItem(process.env.REACT_APP_LOCALHOST_KEY, JSON.stringify(user));
        toast.success("Avatar set successfully!");
        setTimeout(() => navigate("/"), 1000);
      } else {
        toast.error("Error setting avatar. Please try again.", toastOptions);
      }
    } catch (error) {
      console.error("Error setting avatar:", error);
      toast.error("Failed to set avatar. Try again.", toastOptions);
    }
  };

  return (
    <>
      {isLoading ? (
        <Container>
          <img src={Loader} alt="loader" className="loader" />
        </Container>
      ) : (
        <Container>
          <div className="title-container">
            <h1>Pick an Avatar as your profile picture</h1>
          </div>
          <div className="avatars">
            {avatars.map((avatar, index) => (
              <div
                key={index}
                className={`avatar ${selectedAvatar === index ? "selected" : ""}`}
                onClick={() => setSelectedAvatar(index)}
              >
                <img src={avatar} alt="avatar" />
              </div>
            ))}
          </div>
          <button onClick={setProfilePicture} className="submit-btn">
            Set as Profile Picture
          </button>
          <ToastContainer />
        </Container>
      )}
    </>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 3rem;
  background-color: #131324;
  height: 100vh;
  width: 100vw;

  .loader {
    max-inline-size: 100%;
  }

  .title-container {
    h1 {
      color: white;
    }
  }
  
  .avatars {
    display: flex;
    gap: 2rem;

    .avatar {
      border: 0.4rem solid transparent;
      padding: 0.4rem;
      border-radius: 5rem;
      display: flex;
      justify-content: center;
      align-items: center;
      transition: 0.5s ease-in-out;
      cursor: pointer;

      img {
        height: 6rem;
        transition: 0.5s ease-in-out;
      }
    }

    .selected {
      border: 0.4rem solid #4e0eff;
    }
  }
  
  .submit-btn {
    background-color: #4e0eff;
    color: white;
    padding: 1rem 2rem;
    border: none;
    font-weight: bold;
    cursor: pointer;
    border-radius: 0.4rem;
    font-size: 1rem;
    text-transform: uppercase;

    &:hover {
      background-color: #4e0eff;
    }
  }
`;
