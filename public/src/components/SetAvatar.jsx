import React, { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import { Buffer } from "buffer";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { setAvatarRoute } from "../utils/APIRoutes";
import loader from "../assets/loader.gif";

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
    if (!localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    const avatarUrls = [
      "https://api.dicebear.com/7.x/adventurer/svg?seed=avatar1",
      "https://api.dicebear.com/7.x/adventurer/svg?seed=avatar2",
      "https://api.dicebear.com/7.x/adventurer/svg?seed=avatar3",
      "https://api.dicebear.com/7.x/adventurer/svg?seed=avatar4",
    ];
    setAvatars(avatarUrls);
    setIsLoading(false);
  }, []);

  const setProfilePicture = async () => {
    if (selectedAvatar === undefined) {
      toast.error("Please select an avatar", toastOptions);
      return;
    }

    setIsLoading(true);
    const user = JSON.parse(localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY));
    const avatarUrl = avatars[selectedAvatar];

    try {
      const { data: svgData } = await axios.get(avatarUrl, { 
        responseType: 'text',
        timeout: 10000 
      });
      const base64Image = Buffer.from(svgData).toString('base64');
      
      console.log("Sending avatar request to:", `${setAvatarRoute}/${user._id}`);
      console.log("User ID:", user._id);
      console.log("Image data length:", base64Image.length);
      
      const { data } = await axios.post(`${setAvatarRoute}/${user._id}`, {
        image: base64Image,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
        timeout: 30000
      });

      console.log("Backend Response:", data);

      if (data && data.isSet) {
        user.isAvatarImageSet = true;
        user.avatarImage = data.image;
        localStorage.setItem(
          process.env.REACT_APP_LOCALHOST_KEY,
          JSON.stringify(user)
        );
        toast.success("Avatar set successfully!");
        navigate("/");
      } else {
        toast.error(data.msg || data.error || "Failed to set avatar. Please try again.", toastOptions);
      }
    } catch (error) {
      console.error("Error setting avatar:", error.response || error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        toast.error(error.response.data?.error || error.response.data?.msg || "Failed to set avatar", toastOptions);
      } else if (error.request) {
        console.error("Request error:", error.request);
        toast.error("Network error. Please check your connection.", toastOptions);
      } else {
        console.error("Error:", error.message);
        toast.error("An error occurred. Please try again.", toastOptions);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading ? (
        <Container>
          <img src={loader} alt="loader" className="loader" />
        </Container>
      ) : (
        <Container>
          <div className="title-container">
            <h1>Pick an Avatar as your profile picture</h1>
          </div>
          <div className="avatars">
            {avatars.map((avatarUrl, index) => (
              <div
                key={index}
                className={`avatar ${selectedAvatar === index ? "selected" : ""}`}
                onClick={() => setSelectedAvatar(index)}
              >
                <img src={avatarUrl} alt={`Avatar ${index + 1}`} />
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

