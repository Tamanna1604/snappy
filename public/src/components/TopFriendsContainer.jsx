import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import axios from "axios";
import { IoArrowBack } from "react-icons/io5";
import { IoArrowDown } from "react-icons/io5";
import { topFriendsRoute } from "../utils/APIRoutes";

const getFriendshipRank = (messageCount) => {
  if (messageCount >= 30) return { rank: "Besties", symbol: "🥇" };
  if (messageCount >= 10) return { rank: "Good Friends", symbol: "🥈" };
  return { rank: "Buddies", symbol: "🥉" };
};

export default function TopFriendsContainer({ currentUser, handleGoBack }) {
  const [topFriends, setTopFriends] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const friendsEndRef = useRef(null);
  const friendsContainerRef = useRef(null);

  const scrollToBottom = () => {
    friendsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleScroll = () => {
    if (friendsContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = friendsContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom);
    }
  };

  useEffect(() => {
    const container = friendsContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [topFriends]);

  useEffect(() => {
    const fetchTopFriends = async () => {
      if (currentUser) {
        try {
          const { data } = await axios.get(`${topFriendsRoute}/${currentUser._id}`);
          setTopFriends(data);
        } catch (error) {
          // Silent error handling
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    fetchTopFriends();
  }, [currentUser]);

  return (
    <Container>
      <div className="header">
        <button onClick={handleGoBack} className="back-button">
          <IoArrowBack />
        </button>
        <h1>Your Top Friends</h1>
      </div>
      <div className="friends-list" ref={friendsContainerRef}>
        {isLoading ? (
          <div className="loading-container">
            <p>Loading top friends...</p>
          </div>
        ) : topFriends.length > 0 ? (
          topFriends.map((friend) => {
            const { rank, symbol } = getFriendshipRank(friend.messageCount);
            return (
              <div className="friend-card" key={friend._id}>
                <img src={`data:image/svg+xml;base64,${friend.avatarImage}`} alt="avatar" />
                <h2>{friend.username}</h2>
                <div className="rank">
                  {symbol} {rank}
                </div>
                <div className="message-count">
                  {friend.messageCount} messages
                </div>
              </div>
            );
          })
        ) : (
          <div className="empty-state">
            <p>No friends yet! Start a conversation to build your ranks.</p>
          </div>
        )}
        <div ref={friendsEndRef} />
      </div>
      {showScrollButton && (
        <button className="scroll-to-bottom-btn" onClick={scrollToBottom}>
          <IoArrowDown />
        </button>
      )}
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

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2rem;
    background-color: #2c3e50;

    .back-button {
      background: transparent;
      border: none;
      color: white;
      font-size: 1.5rem;
      cursor: pointer;
    }

    h1 {
      font-size: 1.5rem;
      margin: 0;
      color: white;
    }
  }

  .friends-list {
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
    
    .loading-container, .empty-state {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      color: white;
      font-size: 1.1rem;
    }
    
    .friend-card {
      background-color: #34495e;
      padding: 1.5rem;
      border-radius: 1rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      border-left: 4px solid #3498db;
      
      img {
        height: 4rem;
        width: 4rem;
        border-radius: 50%;
      }
      
      h2 {
        color: white;
        margin: 0;
        font-size: 1.2rem;
      }
      
      .rank {
        font-size: 1.1rem;
        font-weight: bold;
        color: #ffd700;
      }
      
      .message-count {
        font-size: 0.9rem;
        color: #bdc3c7;
      }
    }
  }

  .scroll-to-bottom-btn {
    position: absolute;
    bottom: 2rem;
    right: 2rem;
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    background: #3498db;
    color: white;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    transition: all 0.3s ease;
    z-index: 10;
    
    &:hover {
      background: #2980b9;
      transform: scale(1.1);
    }
  }
`; 