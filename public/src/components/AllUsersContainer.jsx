import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { IoArrowBack } from "react-icons/io5";
import axios from "axios";
import { allUsersRoute } from "../utils/APIRoutes";

export default function AllUsersContainer({ currentUser, handleGoBack, onUserSelect }) {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  useEffect(() => {
    const fetchAllUsers = async () => {
      if (currentUser) {
        try {
          const data = await axios.get(`${allUsersRoute}/${currentUser._id}`);
          setAllUsers(data.data);
        } catch (error) {
          console.error("Failed to fetch all users:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchAllUsers();
  }, [currentUser]);

  // Initialize online users from allUsers
  useEffect(() => {
    const onlineUserIds = allUsers
      .filter(user => user.isOnline)
      .map(user => user._id);
    setOnlineUsers(new Set(onlineUserIds));
  }, [allUsers]);

  const handleUserClick = (user) => {
    onUserSelect(user);
  };

  return (
    <Container>
      <div className="header">
        <button onClick={handleGoBack} className="back-button">
          <IoArrowBack />
        </button>
        <h3>All Users</h3>
        <div className="user-count">
          {allUsers.length} users
        </div>
      </div>
      <div className="users-container">
        {loading ? (
          <div className="loading">
            <p>Loading users...</p>
          </div>
        ) : allUsers.length > 0 ? (
          allUsers.map((user) => {
            const isOnline = onlineUsers.has(user._id);
            return (
              <div
                key={user._id}
                className="user-item"
                onClick={() => handleUserClick(user)}
              >
                <div className="avatar">
                  <img
                    src={`data:image/svg+xml;base64,${user.avatarImage}`}
                    alt=""
                  />
                  <div className={`online-indicator ${isOnline ? 'online' : 'offline'}`}></div>
                </div>
                <div className="user-info">
                  <h4>{user.username}</h4>
                  <div className="status-info">
                    <span className={`status-text ${isOnline ? 'online' : 'offline'}`}>
                      {isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
                <div className="action-buttons">
                  <button 
                    className="message-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUserClick(user);
                    }}
                  >
                    Message
                  </button>
                  <button 
                    className="anon-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle anonymous chat - you can add this functionality later
                      alert("Anonymous chat feature coming soon!");
                    }}
                  >
                    Anon
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-users">
            <p>No users found.</p>
          </div>
        )}
      </div>
    </Container>
  );
}

const Container = styled.div`
  display: grid;
  grid-template-rows: 10% 90%;
  overflow: hidden;
  background-color: #080420;

  .header {
    display: flex;
    align-items: center;
    gap: 1rem;
    justify-content: space-between;
    padding: 0 2rem;
    background-color: #2c3e50;
    border-bottom: 1px solid #34495e;

    .back-button {
      background: transparent;
      border: none;
      color: white;
      font-size: 1.5rem;
      cursor: pointer;
    }

    h3 {
      color: white;
      text-transform: uppercase;
      margin: 0;
    }

    .user-count {
      color: #bdc3c7;
      font-size: 0.9rem;
    }
  }

  .users-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow: auto;
    gap: 0.8rem;
    padding: 1rem;
    
    &::-webkit-scrollbar {
      width: 0.2rem;
      
      &-thumb {
        background-color: #ffffff39;
        width: 0.1rem;
        border-radius: 1rem;
      }
    }

    .loading, .no-users {
      color: white;
      text-align: center;
      padding: 2rem;
    }

    .user-item {
      background-color: #ffffff34;
      min-height: 5rem;
      cursor: pointer;
      width: 100%;
      border-radius: 0.5rem;
      padding: 1rem;
      display: flex;
      gap: 1rem;
      align-items: center;
      transition: 0.3s ease-in-out;
      position: relative;

      &:hover {
        background-color: #ffffff50;
      }

      .avatar {
        position: relative;
        
        img {
          height: 3rem;
          border-radius: 50%;
        }
        
        .online-indicator {
          position: absolute;
          bottom: 2px;
          right: 2px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid #080420;
          
          &.online {
            background-color: #4CAF50;
            box-shadow: 0 0 5px #4CAF50;
          }
          
          &.offline {
            background-color: #9e9e9e;
          }
        }
      }

      .user-info {
        flex: 1;
        
        h4 {
          color: white;
          margin: 0;
          margin-bottom: 0.2rem;
        }
        
        .status-info {
          display: flex;
          flex-direction: column;
          gap: 0.1rem;
          
          .status-text {
            font-size: 0.8rem;
            
            &.online {
              color: #4CAF50;
            }
            
            &.offline {
              color: #9e9e9e;
            }
          }
        }
      }

      .action-buttons {
        display: flex;
        gap: 0.5rem;
        
        button {
          padding: 0.3rem 0.8rem;
          border: none;
          border-radius: 0.3rem;
          cursor: pointer;
          font-size: 0.8rem;
          font-weight: bold;
          transition: 0.2s ease;
          
          &.message-btn {
            background-color: #3498db;
            color: white;
            
            &:hover {
              background-color: #2980b9;
            }
          }
          
          &.anon-btn {
            background-color: #e74c3c;
            color: white;
            
            &:hover {
              background-color: #c0392b;
            }
          }
        }
      }
    }
  }
`;
