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
  const [hasAnonymousMessages, setHasAnonymousMessages] = useState(false);

  useEffect(() => {
    const fetchTopFriends = async () => {
      if (currentUser) {
        try {
          const { data } = await axios.get(`${topFriendsRoute}/${currentUser._id}`);
          setTopFriends(data);
          
          // Check if user has anonymous messages
          const hasAnonMessages = localStorage.getItem('hasAnonymousMessages') === 'true';
          setHasAnonymousMessages(hasAnonMessages);
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
        {hasAnonymousMessages && (
          <div className="anon-indicator">
            <span className="anon-icon">👻</span>
            <span className="anon-text">Anonymous Messages</span>
          </div>
        )}
      </div>
      <div className="friends-container">
        {isLoading ? (
          <div className="loading-container">
            <p>Loading top friends...</p>
          </div>
        ) : topFriends.length > 0 ? (
          <div className="friends-grid">
            {topFriends.map((friend, index) => {
              const { rank, symbol } = getFriendshipRank(friend.messageCount);
              return (
                <div className={`friend-card rank-${index + 1}`} key={friend._id}>
                  <div className="rank-badge">
                    #{index + 1}
                  </div>
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
            })}
          </div>
        ) : (
          <div className="empty-state">
            <p>No friends yet! Start a conversation to build your ranks.</p>
          </div>
        )}
      </div>
    </Container>
  );
}

const Container = styled.div`
  display: grid;
  grid-template-rows: 15% 85%;
  gap: 0.1rem;
  overflow: hidden;
  background-color: #080420;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2rem;
    background-color: #2c3e50;
    position: relative;

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

    .anon-indicator {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: white;
      font-size: 0.9rem;
      background: linear-gradient(135deg, #e74c3c, #c0392b);
      padding: 0.5rem 1rem;
      border-radius: 1rem;
      animation: pulse 2s infinite;
      box-shadow: 0 2px 8px rgba(231, 76, 60, 0.3);

      @keyframes pulse {
        0% {
          transform: scale(1);
          box-shadow: 0 2px 8px rgba(231, 76, 60, 0.3);
        }
        50% {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(231, 76, 60, 0.5);
        }
        100% {
          transform: scale(1);
          box-shadow: 0 2px 8px rgba(231, 76, 60, 0.3);
        }
      }

      .anon-icon {
        font-size: 1.2rem;
        animation: bounce 1s infinite;
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-5px);
          }
          60% {
            transform: translateY(-3px);
          }
        }
      }

      .anon-text {
        font-size: 0.9rem;
        font-weight: bold;
      }
    }
  }

  .friends-container {
    padding: 1rem 2rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    
    .loading-container, .empty-state {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      color: white;
      font-size: 1.1rem;
    }
    
    .friends-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
      width: 100%;
      max-width: 800px;
      height: 100%;
      align-items: center;
      
      .friend-card {
        background: linear-gradient(135deg, #34495e, #2c3e50);
        padding: 2rem 1.5rem;
        border-radius: 1.5rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        position: relative;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        
        &:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
        }
        
        &.rank-1 {
          border: 3px solid #ffd700;
          background: linear-gradient(135deg, #34495e, #2c3e50);
          box-shadow: 0 4px 20px rgba(255, 215, 0, 0.3);
          
          .rank-badge {
            background: linear-gradient(135deg, #ffd700, #ffed4e);
            color: #2c3e50;
          }
        }
        
        &.rank-2 {
          border: 3px solid #c0c0c0;
          background: linear-gradient(135deg, #34495e, #2c3e50);
          box-shadow: 0 4px 20px rgba(192, 192, 192, 0.3);
          
          .rank-badge {
            background: linear-gradient(135deg, #c0c0c0, #e5e5e5);
            color: #2c3e50;
          }
        }
        
        &.rank-3 {
          border: 3px solid #cd7f32;
          background: linear-gradient(135deg, #34495e, #2c3e50);
          box-shadow: 0 4px 20px rgba(205, 127, 50, 0.3);
          
          .rank-badge {
            background: linear-gradient(135deg, #cd7f32, #daa520);
            color: white;
          }
        }
        
        .rank-badge {
          position: absolute;
          top: -10px;
          right: -10px;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 0.8rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }
        
        img {
          height: 5rem;
          width: 5rem;
          border-radius: 50%;
          border: 3px solid #3498db;
          box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
        }
        
        h2 {
          color: white;
          margin: 0;
          font-size: 1.3rem;
          font-weight: bold;
        }
        
        .rank {
          font-size: 1.1rem;
          font-weight: bold;
          color: #ffd700;
          text-align: center;
        }
        
        .message-count {
          font-size: 0.9rem;
          color: #bdc3c7;
          background: rgba(52, 152, 219, 0.2);
          padding: 0.3rem 0.8rem;
          border-radius: 1rem;
          border: 1px solid #3498db;
        }
      }
    }
  }
`; 