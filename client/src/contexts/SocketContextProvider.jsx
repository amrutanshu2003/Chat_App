import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const newSocket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:5000', {
        auth: {
          token: localStorage.getItem('token')
        },
        reconnectionAttempts: 5,
        transports: ['websocket']
      });

      setSocket(newSocket);

      const handleConnect = () => {
        console.log('Connected to server');
      };

      const handleDisconnect = () => {
        console.log('Disconnected from server');
      };

      const handleReconnectAttempt = (attempt) => {
        console.log(`Reconnection attempt #${attempt}`);
      };

      const handleError = (error) => {
        console.error('Socket error:', error);
      };

      const handleUserOnline = useCallback((data) => {
        setOnlineUsers(prev => [...prev.filter(id => id !== data.userId), data.userId]);
      }, []);

      const handleUserOffline = useCallback((data) => {
        setOnlineUsers(prev => prev.filter(id => id !== data.userId));
      }, []);

      const addNotification = useCallback((data, type, message) => {
        setNotifications(prev => {
          const newNotif = {
            id: Date.now(),
            type,
            message,
            timestamp: new Date(),
            read: false
          };
          const updated = [newNotif, ...prev];
          return updated.slice(0, 50);
        });
      }, []);

      const handlePostLiked = useCallback((data) => {
        addNotification(data, 'like', `${data.username} liked your post`);
      }, [addNotification]);

      const handlePostCommented = useCallback((data) => {
        addNotification(data, 'comment', `${data.username} commented on your post`);
      }, [addNotification]);

      const handleUserFollowed = useCallback((data) => {
        addNotification(data, 'follow', `${data.username} started following you`);
      }, [addNotification]);

      newSocket.on('connect', handleConnect);
      newSocket.on('disconnect', handleDisconnect);
      newSocket.on('reconnect_attempt', handleReconnectAttempt);
      newSocket.on('error', handleError);
      newSocket.on('user-online', handleUserOnline);
      newSocket.on('user-offline', handleUserOffline);
      newSocket.on('post-liked', handlePostLiked);
      newSocket.on('post-commented', handlePostCommented);
      newSocket.on('user-followed', handleUserFollowed);

      return () => {
        newSocket.off('connect', handleConnect);
        newSocket.off('disconnect', handleDisconnect);
        newSocket.off('reconnect_attempt', handleReconnectAttempt);
        newSocket.off('error', handleError);
        newSocket.off('user-online', handleUserOnline);
        newSocket.off('user-offline', handleUserOffline);
        newSocket.off('post-liked', handlePostLiked);
        newSocket.off('post-commented', handlePostCommented);
        newSocket.off('user-followed', handleUserFollowed);
        newSocket.close();
      };
    }
  }, [user, handleUserOnline, handleUserOffline, handlePostLiked, handlePostCommented, handleUserFollowed]);

  const joinChat = useCallback((chatId) => {
    if (socket) {
      socket.emit('join-chat', chatId);
    }
  }, [socket]);

  const leaveChat = useCallback((chatId) => {
    if (socket) {
      socket.emit('leave-chat', chatId);
    }
  }, [socket]);

  const sendMessage = useCallback((chatId, content, messageType = 'text') => {
    if (socket) {
      socket.emit('send-message', {
        chatId,
        content,
        messageType
      });
    }
  }, [socket]);

  const startTyping = useCallback((chatId) => {
    if (socket) {
      socket.emit('typing-start', { chatId });
    }
  }, [socket]);

  const stopTyping = useCallback((chatId) => {
    if (socket) {
      socket.emit('typing-stop', { chatId });
    }
  }, [socket]);

  const markMessagesRead = useCallback((chatId) => {
    if (socket) {
      socket.emit('mark-messages-read', { chatId });
    }
  }, [socket]);

  const likePost = useCallback((postId, authorId, isLiked) => {
    if (socket) {
      socket.emit('like-post', { postId, authorId, isLiked });
    }
  }, [socket]);

  const commentPost = useCallback((postId, authorId, comment) => {
    if (socket) {
      socket.emit('comment-post', { postId, authorId, comment });
    }
  }, [socket]);

  const followUser = useCallback((userId, isFollowing) => {
    if (socket) {
      socket.emit('follow-user', { userId, isFollowing });
    }
  }, [socket]);

  const markNotificationRead = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    );
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const value = {
    socket,
    onlineUsers,
    notifications,
    joinChat,
    leaveChat,
    sendMessage,
    startTyping,
    stopTyping,
    markMessagesRead,
    likePost,
    commentPost,
    followUser,
    markNotificationRead,
    clearNotifications
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
