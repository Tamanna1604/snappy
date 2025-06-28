import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import ChatInput from "./ChatInput";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { IoArrowBack } from "react-icons/io5";
import { sendMessageRoute, recieveMessageRoute } from "../utils/APIRoutes";

export default function ChatContainer({
  currentChat,
  socket,
  handleBackToWelcome,
  handleStartAnonymousChat,
}) {
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef();
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState("");

  useEffect(async () => {
    const data = await JSON.parse(
      localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
    );
    const response = await axios.post(recieveMessageRoute, {
      from: data._id,
      to: currentChat._id,
    });
    setMessages(response.data);
  }, [currentChat]);

  useEffect(() => {
    const getCurrentChat = async () => {
      if (currentChat) {
        await JSON.parse(
          localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
        )._id;
      }
    };
    getCurrentChat();
  }, [currentChat]);

  const handleSendMsg = async (msg) => {
    const data = await JSON.parse(
      localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
    );
    socket.current.emit("send-msg", {
      to: currentChat._id,
      from: data._id,
      msg,
    });
    await axios.post(sendMessageRoute, {
      from: data._id,
      to: currentChat._id,
      message: msg,
    });

    const msgs = [...messages];
    msgs.push({ fromSelf: true, message: msg });
    setMessages(msgs);
  };

  useEffect(() => {
    if (socket.current) {
      socket.current.on("msg-recieve", (data) => {
        if (!data.isAnonymous && data.from === currentChat._id) {
          setArrivalMessage({ fromSelf: false, message: data.msg });
        }
      });

      // Handle typing indicators
      socket.current.on("typing-start", (data) => {
        if (data.from === currentChat._id) {
          setIsTyping(true);
          setTypingUser(currentChat.username);
        }
      });

      socket.current.on("typing-stop", (data) => {
        if (data.from === currentChat._id) {
          setIsTyping(false);
          setTypingUser("");
        }
      });
    }

    return () => {
      if (socket.current) {
        socket.current.off("typing-start");
        socket.current.off("typing-stop");
      }
    };
  }, [currentChat, socket]);

  useEffect(() => {
    arrivalMessage && setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Container>
      <div className="chat-header">
        <div className="user-details">
          <button onClick={handleBackToWelcome} className="back-button">
            <IoArrowBack />
          </button>
          <div className="avatar">
            <img
              src={`data:image/svg+xml;base64,${currentChat.avatarImage}`}
              alt=""
            />
          </div>
          <div className="username">
            <h3>{currentChat.username}</h3>
            <div className="status">
              <span className={`status-indicator ${currentChat.isOnline ? 'online' : 'offline'}`}></span>
              <span className="status-text">
                {currentChat.isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
        <button
          className="send-anonymously-btn"
          onClick={() => handleStartAnonymousChat(currentChat)}
        >
          Send Anonymously
        </button>
      </div>
      <div className="chat-messages">
        {messages.map((message) => {
          return (
            <div
              ref={scrollRef}
              key={uuidv4()}
              className={`message ${
                message.fromSelf ? "sended" : "recieved"
              }`}
            >
              <div className="content ">
                <p>{message.message}</p>
              </div>
            </div>
          );
        })}
        {isTyping && (
          <div className="typing-indicator">
            <div className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <p>{typingUser} is typing...</p>
          </div>
        )}
      </div>
      <ChatInput 
        handleSendMsg={handleSendMsg} 
        currentChat={currentChat}
        socket={socket}
      />
    </Container>
  );
}

const Container = styled.div`
  display: grid;
  grid-template-rows: 10% 80% 10%;
  gap: 0.1rem;
  overflow: hidden;
  @media screen and (min-width: 720px) and (max-width: 1080px) {
    grid-template-rows: 15% 70% 15%;
  }
  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2rem;
    .user-details {
      display: flex;
      align-items: center;
      gap: 1rem;
      .back-button {
        background-color: transparent;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        display: flex;
        align-items: center;
      }
      .avatar {
        img {
          height: 3rem;
        }
      }
      .username {
        h3 {
          color: white;
          margin: 0;
        }
        .status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.2rem;
          
          .status-indicator {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            
            &.online {
              background-color: #4CAF50;
              box-shadow: 0 0 5px #4CAF50;
            }
            
            &.offline {
              background-color: #9e9e9e;
            }
          }
          
          .status-text {
            color: #b3b3b3;
            font-size: 0.8rem;
          }
        }
      }
    }
    .send-anonymously-btn {
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      background-color: #f39c12;
      border: none;
      color: white;
      font-weight: bold;
      cursor: pointer;
      transition: background-color 0.3s ease;

      &:hover {
        background-color: #e67e22;
      }
    }
  }
  .chat-messages {
    padding: 1rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow: auto;
    &::-webkit-scrollbar {
      width: 0.2rem;
      &-thumb {
        background-color: #ffffff39;
        width: 0.1rem;
        border-radius: 1rem;
      }
    }
    .message {
      display: flex;
      align-items: center;
      .content {
        max-width: 40%;
        overflow-wrap: break-word;
        padding: 1rem;
        font-size: 1.1rem;
        border-radius: 1rem;
        color: #d1d1d1;
      }
    }
    .sended {
      justify-content: flex-end;
      .content {
        background-color: #4f04ff21;
      }
    }
    .recieved {
      justify-content: flex-start;
      .content {
        background-color: #9900ff20;
      }
    }
    .typing-indicator {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background-color: #ffffff10;
      border-radius: 1rem;
      max-width: fit-content;
      
      .typing-dots {
        display: flex;
        gap: 0.2rem;
        
        span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: #9a86f3;
          animation: typing 1.4s infinite ease-in-out;
          
          &:nth-child(1) { animation-delay: -0.32s; }
          &:nth-child(2) { animation-delay: -0.16s; }
        }
      }
      
      p {
        color: #b3b3b3;
        font-size: 0.9rem;
        margin: 0;
      }
    }
  }
  
  @keyframes typing {
    0%, 80%, 100% {
      transform: scale(0.8);
      opacity: 0.5;
    }
    40% {
      transform: scale(1);
      opacity: 1;
    }
  }
`;
