import React, { useState, useEffect, useRef } from "react";
import { BsEmojiSmileFill } from "react-icons/bs";
import { IoMdSend } from "react-icons/io";
import styled from "styled-components";
import Picker from "emoji-picker-react";
import axios from "axios";
import { host } from "../utils/APIRoutes";

export default function ChatInput({ handleSendMsg, disabled = false, currentChat, socket }) {
  const [msg, setMsg] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  
  const handleEmojiPickerhideShow = () => {
    if (!disabled) {
      setShowEmojiPicker(!showEmojiPicker);
    }
  };

  const handleEmojiClick = (event, emojiObject) => {
    if (!disabled) {
      let message = msg;
      message += emojiObject.emoji;
      setMsg(message);
    }
  };

  // Handle typing indicators via API
  const handleTyping = async () => {
    if (!disabled && currentChat) {
      try {
        const currentUser = JSON.parse(localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY));
        
        if (!isTyping) {
          setIsTyping(true);
          
          // Call API instead of direct socket emission
          await axios.post(`${host}/api/messages/typing-start`, {
            userId: currentUser._id,
            to: currentChat._id,
          });
        }

        // Clear existing timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        // Set new timeout to stop typing indicator
        typingTimeoutRef.current = setTimeout(async () => {
          setIsTyping(false);
          
          // Call API to stop typing indicator
          try {
            await axios.post(`${host}/api/messages/typing-stop`, {
              userId: currentUser._id,
              to: currentChat._id,
            });
          } catch (error) {
            console.error("Error stopping typing indicator:", error);
          }
        }, 1000); // Stop typing indicator after 1 second of no input
      } catch (error) {
        console.error("Error starting typing indicator:", error);
        setIsTyping(false);
      }
    }
  };

  const sendChat = async (event) => {
    event.preventDefault();
    if (msg.length > 0 && !disabled) {
      try {
        const currentUser = JSON.parse(localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY));
        
        // Stop typing indicator when sending message
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = null;
        }
        
        if (isTyping) {
          setIsTyping(false);
          
          // Call API to stop typing indicator
          await axios.post(`${host}/api/messages/typing-stop`, {
            userId: currentUser._id,
            to: currentChat._id,
          });
        }
        
        handleSendMsg(msg);
        setMsg("");
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Container>
      <div className="button-container">
        <div className="emoji">
          <BsEmojiSmileFill 
            onClick={handleEmojiPickerhideShow}
            style={{ opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
          />
          {showEmojiPicker && <Picker onEmojiClick={handleEmojiClick} />}
        </div>
      </div>
      <form className="input-container" onSubmit={(event) => sendChat(event)}>
        <input
          type="text"
          placeholder={disabled ? "Cannot send messages - user has blocked you" : "type your message here"}
          onChange={(e) => {
            if (!disabled) {
              setMsg(e.target.value);
              handleTyping();
            }
          }}
          value={msg}
          disabled={disabled}
        />
        <button type="submit" disabled={disabled}>
          <IoMdSend />
        </button>
      </form>
    </Container>
  );
}

const Container = styled.div`
  display: grid;
  align-items: center;
  grid-template-columns: 5% 95%;
  background-color: #080420;
  padding: 0 2rem;
  @media screen and (min-width: 720px) and (max-width: 1080px) {
    padding: 0 1rem;
    gap: 1rem;
  }
  .button-container {
    display: flex;
    align-items: center;
    color: white;
    gap: 1rem;
    .emoji {
      position: relative;
      svg {
        font-size: 1.5rem;
        color: #ffff00c8;
        cursor: pointer;
      }
      .emoji-picker-react {
        position: absolute;
        top: -350px;
        background-color: #080420;
        box-shadow: 0 5px 10px #9a86f3;
        border-color: #9a86f3;
        .emoji-scroll-wrapper::-webkit-scrollbar {
          background-color: #080420;
          width: 5px;
          &-thumb {
            background-color: #9a86f3;
          }
        }
        .emoji-categories {
          button {
            filter: contrast(0);
          }
        }
        .emoji-search {
          background-color: transparent;
          border-color: #9a86f3;
        }
        .emoji-group:before {
          background-color: #080420;
        }
      }
    }
  }
  .input-container {
    width: 100%;
    border-radius: 2rem;
    display: flex;
    align-items: center;
    gap: 2rem;
    background-color: #ffffff34;
    input {
      width: 90%;
      height: 60%;
      background-color: transparent;
      color: white;
      border: none;
      padding-left: 1rem;
      font-size: 1.2rem;

      &::selection {
        background-color: #9a86f3;
      }
      &:focus {
        outline: none;
      }
      
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
    button {
      padding: 0.3rem 2rem;
      border-radius: 2rem;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #9a86f3;
      border: none;
      @media screen and (min-width: 720px) and (max-width: 1080px) {
        padding: 0.3rem 1rem;
        svg {
          font-size: 1rem;
        }
      }
      svg {
        font-size: 2rem;
        color: white;
      }
      
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        background-color: #666;
      }
    }
  }
`;
