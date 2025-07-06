import React, { createContext, useReducer, useState, useEffect } from 'react';
import socketIoClient from 'socket.io-client';

export const GeneralSocketContext = createContext();

const WS = 'http://localhost:6001';
const socket = socketIoClient(WS);

export const GeneralSocketProvider = ({ children }) => {
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isCreateStoryOpen, setIsCreateStoryOpen] = useState(false);
  const [isNotification, setIsNotification] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [chatFriends, setChatFriends] = useState([]);

  const INITIAL_STATE = {
    chatId: null,
    user: {},
  };

  const userId = localStorage.getItem('userId');

  const chatReducer = (state, action) => {
    switch (action.type) {
      case 'CHANGE_USER':
        return {
          user: action.payload.user,
          chatId: userId > action.payload._id ? userId : action.payload.userId + userId,
        };
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(chatReducer, INITIAL_STATE);

  return (
    <GeneralSocketContext.Provider
      value={{
        socket,
        isCreatePostOpen,
        setIsCreatePostOpen,
        isCreateStoryOpen,
        setIsCreateStoryOpen,
        isNotification,
        setIsNotification,
        notifications,
        setNotifications,
        chatFriends,
        setChatFriends,
        state,
        dispatch,
      }}
    >
      {children}
    </GeneralSocketContext.Provider>
  );
}