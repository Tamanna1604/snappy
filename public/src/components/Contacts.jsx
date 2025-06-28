import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Logo from "../assets/logo.svg";

export default function Contacts({ contacts, changeChat, socket }) {
  const [currentUserName, setCurrentUserName] = useState(undefined);
  const [currentUserImage, setCurrentUserImage] = useState(undefined);
  const [currentSelected, setCurrentSelected] = useState(undefined);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  useEffect(() => {
    const storedUser = localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY);
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUserName(user.username);
      setCurrentUserImage(user.avatarImage);
    }
  }, []);

  // Listen for online/offline status updates
  useEffect(() => {
    if (socket?.current) {
      socket.current.on("user-online", (data) => {
        console.log("User online:", data.userId);
        setOnlineUsers(prev => new Set([...prev, data.userId]));
      });

      socket.current.on("user-offline", (data) => {
        console.log("User offline:", data.userId);
        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.userId);
          return newSet;
        });
      });
    }

    return () => {
      if (socket?.current) {
        socket.current.off("user-online");
        socket.current.off("user-offline");
      }
    };
  }, [socket]);

  // Initialize online users from contacts
  useEffect(() => {
    const onlineContactIds = contacts
      .filter(contact => contact.isOnline)
      .map(contact => contact._id);
    setOnlineUsers(new Set(onlineContactIds));
  }, [contacts]);
  
  const changeCurrentChat = (index, contact) => {
    setCurrentSelected(index);
    changeChat(contact);
  };

  return (
    <>
      {currentUserImage && currentUserName && (
        <Container>
          <div className="brand">
            <img src={Logo} alt="logo" />
            <h3>snappy</h3>
          </div>
          <div className="contacts">
            {contacts.map((contact, index) => {
              const isOnline = onlineUsers.has(contact._id);
              return (
                <div
                  key={contact._id}
                  className={`contact ${
                    index === currentSelected ? "selected" : ""
                  }`}
                  onClick={() => changeCurrentChat(index, contact)}
                >
                  <div className="avatar">
                    <img
                      src={`data:image/svg+xml;base64,${contact.avatarImage}`}
                      alt=""
                    />
                    <div className={`online-indicator ${isOnline ? 'online' : 'offline'}`}></div>
                  </div>
                  <div className="username">
                    <h3>{contact.username}</h3>
                    <div className="status-info">
                      <span className={`status-text ${isOnline ? 'online' : 'offline'}`}>
                        {isOnline ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="current-user">
            <div className="avatar">
              <img
                src={`data:image/svg+xml;base64,${currentUserImage}`}
                alt="avatar"
              />
              <div className="online-indicator online"></div>
            </div>
            <div className="username">
              <h2>{currentUserName}</h2>
              <span className="status-text online">Online</span>
            </div>
          </div>
        </Container>
      )}
    </>
  );
}

const Container = styled.div`
  display: grid;
  grid-template-rows: 10% 75% 15%;
  overflow: hidden;
  background-color: #080420;

  .brand {
    display: flex;
    align-items: center;
    gap: 1rem;
    justify-content: center;
    
    img {
      height: 2rem;
    }

    h3 {
      color: white;
      text-transform: uppercase;
    }
  }

  .contacts {
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow: auto;
    gap: 0.8rem;
    
    &::-webkit-scrollbar {
      width: 0.2rem;
      
      &-thumb {
        background-color: #ffffff39;
        width: 0.1rem;
        border-radius: 1rem;
      }
    }

    .contact {
      background-color: #ffffff34;
      min-height: 5rem;
      cursor: pointer;
      width: 90%;
      border-radius: 0.2rem;
      padding: 0.4rem;
      display: flex;
      gap: 1rem;
      align-items: center;
      transition: 0.5s ease-in-out;
      position: relative;

      .avatar {
        position: relative;
        
        img {
          height: 3rem;
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

      .username {
        h3 {
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
    }

    .selected {
      background-color: #9a86f3;
    }
  }

  .current-user {
    background-color: #0d0d30;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2rem;

    .avatar {
      position: relative;
      
      img {
        height: 4rem;
        max-inline-size: 100%;
      }
      
      .online-indicator {
        position: absolute;
        bottom: 2px;
        right: 2px;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        border: 2px solid #0d0d30;
        background-color: #4CAF50;
        box-shadow: 0 0 5px #4CAF50;
      }
    }

    .username {
      h2 {
        color: white;
        margin: 0;
        margin-bottom: 0.2rem;
      }
      
      .status-text {
        font-size: 0.9rem;
        color: #4CAF50;
      }

      @media screen and (min-width: 720px) and (max-width: 1080px) {
        gap: 0.5rem;

        .username {
          h2 {
            font-size: 1rem;
          }
        }
      }
    }
  }
`;
