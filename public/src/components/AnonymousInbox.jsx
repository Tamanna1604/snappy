import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import { getAnonymousInboxForReceiverRoute, requestIdentityRevelationRoute, stopReceivingRoute, getRevealedSenderInfoRoute } from "../utils/APIRoutes";
import { IoArrowBack } from "react-icons/io5";

export default function AnonymousInbox({ currentUser, handleBack }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInbox = async () => {
      if (currentUser) {
        try {
          const { data } = await axios.get(
            `${getAnonymousInboxForReceiverRoute}/${currentUser._id}`
          );
          setMessages(data);
          
          // Fetch sender info for messages with revealed identity
          const messagesWithRevealedIdentity = data.filter(msg => msg.identityRevealed);
          for (const msg of messagesWithRevealedIdentity) {
            try {
              const senderInfo = await axios.get(`${getRevealedSenderInfoRoute}/${msg.id}`);
              setMessages(prev => prev.map(m => 
                m.id === msg.id 
                  ? { ...m, senderUsername: senderInfo.data.senderUsername, senderAvatar: senderInfo.data.senderAvatar }
                  : m
              ));
            } catch (error) {
              console.error("Failed to fetch sender info for message:", msg.id, error);
            }
          }
        } catch (error) {
          console.error("Failed to fetch anonymous inbox:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchInbox();
  }, [currentUser]);

  const handleRevealIdentity = async (messageId) => {
    try {
      // This only requests identity revelation, doesn't reveal it immediately
      await axios.post(requestIdentityRevelationRoute, { messageId });
      
      // Update the message to show that revelation has been requested
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, identityRevealRequested: true }
          : msg
      ));
    } catch (error) {
      console.error("Failed to request identity revelation:", error);
    }
  };

  const handleStopReceiving = async (messageId) => {
    try {
      await axios.post(stopReceivingRoute, { messageId });
      
      // Remove the message from the inbox
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (error) {
      console.error("Failed to stop receiving messages:", error);
    }
  };

  return (
    <Container>
      <div className="inbox-header">
        <button onClick={handleBack} className="back-button">
          <IoArrowBack />
        </button>
        <h3>Anonymous Inbox</h3>
        <button onClick={() => window.location.reload()} className="refresh-button">
          Refresh
        </button>
      </div>
      <div className="messages-container">
        {loading ? (
          <p>Loading messages...</p>
        ) : messages.length > 0 ? (
          messages.map((msg) => (
            <div className="message" key={msg.id}>
              <p className="message-text">{msg.message}</p>
              <p className="timestamp">
                {new Date(msg.timestamp).toLocaleString()}
              </p>
              {msg.identityRevealed ? (
                <div className="sender-info">
                  <div className="sender-avatar">
                    <img
                      src={`data:image/svg+xml;base64,${msg.senderAvatar}`}
                      alt=""
                    />
                  </div>
                  <div className="sender-details">
                    <p className="sender-name">From: {msg.senderUsername}</p>
                    <p className="revealed-status">Identity Revealed</p>
                  </div>
                </div>
              ) : (
                <div className="message-controls">
                  <button 
                    className="reveal-btn"
                    onClick={() => handleRevealIdentity(msg.id)}
                    disabled={msg.identityRevealRequested}
                  >
                    {msg.identityRevealRequested ? "Request Sent" : "Request Identity"}
                  </button>
                  <button 
                    className="stop-btn"
                    onClick={() => handleStopReceiving(msg.id)}
                  >
                    Stop Receiving Messages
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <p>Your anonymous inbox is empty.</p>
        )}
      </div>
    </Container>
  );
}

const Container = styled.div`
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background-color: #1a1a2e;
  color: white;

  .inbox-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #ffffff20;

    .back-button {
      background: transparent;
      border: none;
      color: white;
      font-size: 2rem;
      cursor: pointer;
    }

    h3 {
      font-size: 1.5rem;
    }

    .refresh-button {
      background: transparent;
      border: none;
      color: white;
      font-size: 1rem;
      cursor: pointer;
    }
  }

  .messages-container {
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .message {
    background-color: #2c3e50;
    padding: 1rem;
    border-radius: 0.5rem;
    .message-text {
      font-size: 1.1rem;
    }
    .timestamp {
      font-size: 0.7rem;
      text-align: right;
      color: #bdc3c7;
      margin-top: 0.5rem;
    }
    .sender-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 0.5rem;
      
      .sender-avatar {
        img {
          width: 2rem;
          height: 2rem;
          border-radius: 50%;
        }
      }
      
      .sender-details {
        p {
          margin: 0;
        }
        
        .sender-name {
          font-size: 0.8rem;
          color: #27ae60;
          font-weight: bold;
        }
        
        .revealed-status {
          font-size: 0.7rem;
          color: #bdc3c7;
        }
      }
    }
    
    .message-controls {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.5rem;
      
      button {
        padding: 0.3rem 0.6rem;
        border: none;
        border-radius: 0.3rem;
        font-size: 0.7rem;
        cursor: pointer;
        transition: background-color 0.3s ease;
      }
      
      .reveal-btn {
        background-color: #3498db;
        color: white;
        
        &:hover {
          background-color: #2980b9;
        }
        
        &:disabled {
          background-color: #95a5a6;
          cursor: not-allowed;
          opacity: 0.7;
        }
      }
      
      .stop-btn {
        background-color: #e74c3c;
        color: white;
        
        &:hover {
          background-color: #c0392b;
        }
      }
    }
  }
`; 