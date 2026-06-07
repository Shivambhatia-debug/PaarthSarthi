import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import config from '../constants/config';

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  return context;
};

export const SocketProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  useEffect(() => {
    if (isAuthenticated && token) {
      // Connect to Socket.IO
      const socket = io(config.API_BASE_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
      });

      socket.on('connect', () => {
        console.log('Socket connected');
        setIsConnected(true);
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      socket.on('connect_error', (err) => {
        console.log('Socket connection error:', err.message);
        setIsConnected(false);
      });

      // Track online users
      socket.on('userOnline', ({ userId }) => {
        setOnlineUsers(prev => new Set([...prev, userId]));
      });

      socket.on('userOffline', ({ userId }) => {
        setOnlineUsers(prev => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
      });

      socketRef.current = socket;

      return () => {
        socket.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      };
    }
  }, [isAuthenticated, token]);

  const joinConversation = (conversationId) => {
    socketRef.current?.emit('joinConversation', conversationId);
  };

  const leaveConversation = (conversationId) => {
    socketRef.current?.emit('leaveConversation', conversationId);
  };

  const emitMessage = (conversationId, message) => {
    socketRef.current?.emit('sendMessage', { conversationId, message });
  };

  const emitTyping = (conversationId, isTyping) => {
    socketRef.current?.emit('typing', { conversationId, isTyping });
  };

  const joinCommunity = () => {
    socketRef.current?.emit('joinCommunity');
  };

  const isUserOnline = (userId) => {
    return onlineUsers.has(userId);
  };

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        isConnected,
        onlineUsers,
        joinConversation,
        leaveConversation,
        emitMessage,
        emitTyping,
        joinCommunity,
        isUserOnline,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
