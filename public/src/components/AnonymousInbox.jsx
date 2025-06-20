import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import { getAnonymousInboxForReceiverRoute } from "../utils/APIRoutes";
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
        } catch (error) {
          console.error("Failed to fetch anonymous inbox:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchInbox();
  }, [currentUser]);

  return (
    <Container>
      <div className="inbox-header">
        <button onClick={handleBack} className="back-button">
          <IoArrowBack />
        </button>
        <h3>Anonymous Inbox</h3>
      </div>
      <div className="messages-container">
        {loading ? (
          <p>Loading messages...</p>
        ) : messages.length > 0 ? (
          messages.map((msg) => (
            <div className="message" key={msg.id}>
              <p className="message-text">{msg.message}</p>
              <p className="message-time">
                {new Date(msg.timestamp).toLocaleString()}
              </p>
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
    .message-time {
      font-size: 0.7rem;
      text-align: right;
      color: #bdc3c7;
      margin-top: 0.5rem;
    }
  }
`; 