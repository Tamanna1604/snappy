import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import { IoArrowBack } from "react-icons/io5";
import { topFriendsRoute } from "../utils/APIRoutes";

const getFriendshipRank = (messageCount) => {
  if (messageCount >= 30) return { rank: "Besties", symbol: "🥇" };
  if (messageCount >= 10) return { rank: "Good Friends", symbol: "🥈" };
  return { rank: "Buddies", symbol: "🥉" };
};

export default function TopFriendsContainer({ currentUser, handleGoBack }) {
  const [topFriends, setTopFriends] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("[TopFriendsContainer] Component mounted with user:", currentUser);
    const fetchTopFriends = async () => {
      if (currentUser) {
        console.log("[TopFriendsContainer] Fetching top friends for user:", currentUser._id);
        try {
          const { data } = await axios.get(`${topFriendsRoute}/${currentUser._id}`);
          console.log("[TopFriendsContainer] API Response Data:", data);
          setTopFriends(data);
        } catch (error) {
          console.error("[TopFriendsContainer] Error fetching top friends:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        console.log("[TopFriendsContainer] No current user, skipping fetch.");
        setIsLoading(false);
      }
    };
    fetchTopFriends();
  }, [currentUser]);

  console.log("[TopFriendsContainer] Rendering with state:", { topFriends, isLoading });

  return (
    <Container>
      <div className="header">
        <button onClick={handleGoBack} className="back-button">
          <IoArrowBack />
        </button>
        <h1>Your Top Friends</h1>
      </div>
      <div className="friends-list">
        {isLoading ? (
          <p>Loading...</p>
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
              </div>
            );
          })
        ) : (
          <p>No friends yet! Start a conversation to build your ranks.</p>
        )}
      </div>
    </Container>
  );
}

const Container = styled.div`
  padding: 2rem;
  color: white;
  .header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
    .back-button {
      background: #9a86f3;
      border: none;
      color: white;
      font-size: 1.5rem;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
    }
  }
  .friends-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1.5rem;
    text-align: center;
    .friend-card {
      background-color: #ffffff10;
      padding: 1.5rem;
      border-radius: 1rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      img {
        height: 6rem;
        border-radius: 50%;
      }
      .rank {
        font-size: 1.2rem;
        font-weight: bold;
        color: #ffd700;
      }
    }
  }
`; 