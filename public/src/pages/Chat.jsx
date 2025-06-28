import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import styled from "styled-components";
import { allUsersRoute, contactsRoute, host } from "../utils/APIRoutes";
import ChatContainer from "../components/ChatContainer";
import Contacts from "../components/Contacts";
import Welcome from "../components/Welcome";
import TopFriendsContainer from "../components/TopFriendsContainer";
import AnonymousChatContainer from "../components/AnonymousChatContainer";
import AnonymousInbox from "../components/AnonymousInbox";
import AllUsersContainer from "../components/AllUsersContainer";

export default function Chat() {
  const navigate = useNavigate();
  const socket = useRef();
  const [contacts, setContacts] = useState([]);
  const [currentChat, setCurrentChat] = useState(undefined);
  const [currentUser, setCurrentUser] = useState(undefined);
  const [showTopFriends, setShowTopFriends] = useState(false);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [isAnonymousChat, setIsAnonymousChat] = useState(false);
  const [anonymousChatUser, setAnonymousChatUser] = useState(undefined);
  const [showAnonymousInbox, setShowAnonymousInbox] = useState(false);
  const [hasNewAnonymousMessage, setHasNewAnonymousMessage] = useState(false);

  const refreshContacts = async () => {
    if (currentUser && currentUser.isAvatarImageSet) {
      try {
        const data = await axios.get(`${contactsRoute}/${currentUser._id}`);
        setContacts(data.data);
      } catch (error) {
        console.error("Error refreshing contacts:", error);
      }
    }
  };

  useEffect(() => {
    async function fetchUser() {
      if (!localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)) {
        navigate("/login");
      } else {
        const user = await JSON.parse(
          localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
        );
        setCurrentUser(user);
      }
    }
    fetchUser();
  }, [navigate]);

  useEffect(() => {
    if (currentUser) {
      socket.current = io(host);
      socket.current.emit("add-user", currentUser._id);
      
      socket.current.on("msg-recieve", (data) => {
        if (data.isAnonymous) {
          setHasNewAnonymousMessage(true);
          // Set flag for anonymous messages animation
          localStorage.setItem('hasAnonymousMessages', 'true');
        }
      });

      // Listen for online/offline events and refresh contacts
      socket.current.on("user-online", () => {
        refreshContacts();
      });

      socket.current.on("user-offline", () => {
        refreshContacts();
      });

      // Handle page unload (browser close, refresh, navigation)
      const handleBeforeUnload = async () => {
        try {
          if (socket.current) {
            socket.current.disconnect();
          }
          // Call logout endpoint
          await axios.get(`${host}/api/auth/logout/${currentUser._id}`);
        } catch (error) {
          console.error("Error during page unload:", error);
        }
      };

      window.addEventListener('beforeunload', handleBeforeUnload);

      return () => {
        if (socket.current) {
          socket.current.off("msg-recieve");
          socket.current.off("user-online");
          socket.current.off("user-offline");
          socket.current.disconnect();
        }
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [currentUser]);

  useEffect(() => {
    async function fetchContacts() {
      if (currentUser) {
        if (currentUser.isAvatarImageSet) {
          const data = await axios.get(`${contactsRoute}/${currentUser._id}`);
          setContacts(data.data);
        } else {
          navigate("/setAvatar");
        }
      }
    }
    fetchContacts();
    
    // Set up periodic refresh of contacts to keep online status accurate
    const intervalId = setInterval(fetchContacts, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(intervalId);
  }, [currentUser, navigate]);

  const handleChatChange = (chat) => {
    setCurrentChat(chat);
    setShowTopFriends(false);
    setShowAllUsers(false);
    setIsAnonymousChat(false);
    setShowAnonymousInbox(false);
  };

  const handleStartAnonymousChat = (user) => {
    setAnonymousChatUser(user);
    setIsAnonymousChat(true);
    setCurrentChat(undefined);
    setShowTopFriends(false);
    setShowAllUsers(false);
    setShowAnonymousInbox(false);
  };

  const handleShowAnonymousInbox = () => {
    setShowAnonymousInbox(true);
    setHasNewAnonymousMessage(false);
    setCurrentChat(undefined);
    setShowTopFriends(false);
    setShowAllUsers(false);
    setIsAnonymousChat(false);
  };

  const handleBackToWelcome = () => {
    setCurrentChat(undefined);
    setShowTopFriends(false);
    setShowAllUsers(false);
    setIsAnonymousChat(false);
    setShowAnonymousInbox(false);
  };

  const handleShowTopFriends = () => {
    setShowTopFriends(true);
  };

  const handleHideTopFriends = () => {
    setShowTopFriends(false);
  };

  const handleShowAllUsers = () => {
    setShowAllUsers(true);
  };

  const handleUserSelectFromAllUsers = (user) => {
    setCurrentChat(user);
    setShowAllUsers(false);
    setShowTopFriends(false);
    setIsAnonymousChat(false);
    setShowAnonymousInbox(false);
  };

  return (
    <>
      <Container>
        <div className="container">
          <Contacts
            contacts={contacts}
            changeChat={handleChatChange}
          />
          {isAnonymousChat && anonymousChatUser ? (
            <AnonymousChatContainer
              currentChat={anonymousChatUser}
              socket={socket}
              handleGoBack={handleBackToWelcome}
            />
          ) : showAnonymousInbox ? (
            <AnonymousInbox
              currentUser={currentUser}
              handleBack={handleBackToWelcome}
            />
          ) : showTopFriends ? (
            <TopFriendsContainer
              currentUser={currentUser}
              handleGoBack={handleBackToWelcome}
            />
          ) : showAllUsers ? (
            <AllUsersContainer
              currentUser={currentUser}
              handleGoBack={handleBackToWelcome}
              onUserSelect={handleUserSelectFromAllUsers}
            />
          ) : currentChat === undefined ? (
            <Welcome
              handleShowTopFriends={() => setShowTopFriends(true)}
              onShowAnonymousInbox={handleShowAnonymousInbox}
              hasNewAnonymousMessage={hasNewAnonymousMessage}
              socket={socket}
              onShowAllUsers={handleShowAllUsers}
            />
          ) : (
            <ChatContainer
              currentChat={currentChat}
              socket={socket}
              handleBackToWelcome={handleBackToWelcome}
              handleStartAnonymousChat={handleStartAnonymousChat}
            />
          )}
        </div>
      </Container>
    </>
  );
}

const Container = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  align-items: center;
  background-color: #131324;
  .container {
    height: 85vh;
    width: 85vw;
    background-color: #00000076;
    display: grid;
    grid-template-columns: 25% 75%;
    @media screen and (min-width: 720px) and (max-width: 1080px) {
      grid-template-columns: 35% 65%;
    }
  }
`;
