import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import ChatInput from "./ChatInput";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { IoArrowBack } from "react-icons/io5";
import {
  sendMessageRoute,
  getAnonymousChatForSenderRoute,
  revealIdentityRoute,
} from "../utils/APIRoutes";

export default function AnonymousChatContainer({
  currentChat,
  socket,
  handleGoBack,
}) {
  const [messages, setMessages] = useState([]);
  const [canSendMessages, setCanSendMessages] = useState(true);
  const [pendingRevealRequest, setPendingRevealRequest] = useState(false);
  const scrollRef = useRef();

  useEffect(() => {
    const fetchAnonymousMessages = async () => {
      const data = await JSON.parse(
        localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
      );
      const response = await axios.post(getAnonymousChatForSenderRoute, {
        from: data._id,
        to: currentChat._id,
      });
      setMessages(response.data);
      
      // Check if any message has receivingStopped flag
      const hasStoppedReceiving = response.data.some(msg => msg.receivingStopped);
      setCanSendMessages(!hasStoppedReceiving);
      
      // Check if any message has identityRevealRequested flag
      const hasRevealRequest = response.data.some(msg => msg.identityRevealRequested);
      setPendingRevealRequest(hasRevealRequest);
    };

    if (currentChat) {
      fetchAnonymousMessages();
    }
  }, [currentChat]);

  const handleSendMsg = async (msg) => {
    if (!canSendMessages) return;
    
    const data = await JSON.parse(
      localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
    );

    await axios.post(sendMessageRoute, {
      from: data._id,
      to: currentChat._id,
      message: msg,
      isAnonymous: true,
    });

    socket.current.emit("send-msg", {
      to: currentChat._id,
      from: data._id,
      msg,
      isAnonymous: true,
    });

    const msgs = [...messages];
    msgs.push({ fromSelf: true, message: msg });
    setMessages(msgs);
  };

  const handleRevealIdentity = async () => {
    try {
      const data = await JSON.parse(
        localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
      );
      
      // Find the first message that has a reveal request
      const messageWithRequest = messages.find(msg => msg.identityRevealRequested);
      if (messageWithRequest) {
        await axios.post(revealIdentityRoute, { messageId: messageWithRequest.id });
        setPendingRevealRequest(false);
        // Update the message to show identity is revealed
        setMessages(prev => prev.map(msg => 
          msg.identityRevealRequested 
            ? { ...msg, identityRevealed: true, identityRevealRequested: false }
            : msg
        ));
        
        // Show a success message
        alert("Identity revealed successfully!");
      }
    } catch (error) {
      console.error("Failed to reveal identity:", error);
      alert("Failed to reveal identity. Please try again.");
    }
  };

  useEffect(() => {
    if (socket.current) {
      const messageListener = (data) => {
        if (data.isAnonymous && data.from === currentChat._id) {
          setMessages((prev) => [...prev, { fromSelf: false, message: data.msg }]);
        }
      };
      socket.current.on("msg-recieve", messageListener);

      return () => {
        socket.current.off("msg-recieve", messageListener);
      };
    }
  }, [socket, currentChat]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Container>
      <div className="chat-header">
        <div className="user-details">
          <button onClick={handleGoBack} className="back-button">
            <IoArrowBack />
          </button>
          <div className="avatar">
            <img
              src={`data:image/svg+xml;base64,${currentChat.avatarImage}`}
              alt=""
            />
          </div>
          <div className="username">
            <h3>Anonymous Chat with {currentChat.username}</h3>
          </div>
        </div>
        <div className="header-controls">
          {pendingRevealRequest && (
            <button className="reveal-identity-btn" onClick={handleRevealIdentity}>
              Reveal Identity
            </button>
          )}
          <button onClick={() => window.location.reload()} className="refresh-button">
            Refresh
          </button>
        </div>
      </div>
      {!canSendMessages && (
        <div className="blocked-notice">
          <p>This user has stopped receiving anonymous messages from you.</p>
        </div>
      )}
      <div className="chat-messages">
        {messages.map((message) => {
          return (
            <div ref={scrollRef} key={uuidv4()}>
              <div
                className={`message ${
                  message.fromSelf ? "sended" : "recieved"
                }`}
              >
                <div className="content ">
                  <p>{message.message}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <ChatInput handleSendMsg={handleSendMsg} disabled={!canSendMessages} />
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
    background-color: #2c3e50;
    .user-details {
      display: flex;
      align-items: center;
      gap: 1rem;
      .back-button {
        background: transparent;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
      }
      .avatar {
        img {
          height: 3rem;
        }
      }
      .username {
        h3 {
          color: white;
        }
      }
    }
    .header-controls {
      display: flex;
      gap: 1rem;
      align-items: center;
      
      .reveal-identity-btn {
        padding: 0.5rem 1rem;
        background-color: #e74c3c;
        color: white;
        border: none;
        border-radius: 0.3rem;
        cursor: pointer;
        font-weight: bold;
        &:hover {
          background-color: #c0392b;
        }
      }
      
      .refresh-button {
        padding: 0.5rem 1rem;
        background-color: #3498db;
        color: white;
        border: none;
        border-radius: 0.3rem;
        cursor: pointer;
        font-weight: bold;
        &:hover {
          background-color: #2980b9;
        }
      }
    }
  }
  .blocked-notice {
    background-color: #e74c3c;
    color: white;
    padding: 0.5rem;
    text-align: center;
    font-size: 0.9rem;
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
        @media screen and (min-width: 720px) and (max-width: 1080px) {
          max-width: 70%;
        }
      }
    }
    .sended {
      justify-content: flex-end;
      .content {
        background-color: #3498db;
      }
    }
    .recieved {
      justify-content: flex-start;
      .content {
        background-color: #95a5a6;
      }
    }
  }
`; 