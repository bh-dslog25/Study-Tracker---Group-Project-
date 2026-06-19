import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
  const [onlineUsers, setOnlineUsers] = useState(new Map()); // userId -> true
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);
  const connectedRef = useRef(false);
  const [currentUser, setCurrentUser] = useState(() => {
    const storedUser = localStorage.getItem('user_info') || localStorage.getItem('admin_info');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Listen for localStorage changes (login/logout)
  useEffect(() => {
    const handleStorage = () => {
      const storedUser = localStorage.getItem('user_info') || localStorage.getItem('admin_info');
      const user = storedUser ? JSON.parse(storedUser) : null;
      setCurrentUser(prev => {
        // Only update if user actually changed
        if (prev?.id !== user?.id) {
          console.log('[Socket] User changed:', prev?.id, '->', user?.id);
        }
        return user;
      });
    };
    // Override localStorage.setItem to catch changes in same tab
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
      const oldValue = localStorage.getItem(key);
      originalSetItem.call(this, key, value);
      if (key === 'user_info' || key === 'admin_info') {
        handleStorage();
      }
    };
    window.addEventListener('storage', handleStorage);
    // Also poll every 500ms as fallback
    const interval = setInterval(handleStorage, 500);
    return () => {
      localStorage.setItem = originalSetItem;
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const user = currentUser;

    // If not logged in at all, disconnect socket
    if (!user || !user.id) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        connectedRef.current = false;
        setSocket(null);
        setOnlineUsers(new Map());
      }
      return;
    }

    // If already connected with same user, do not reconnect
    if (connectedRef.current && socketRef.current) {
      return;
    }

    // Create new socket connection
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });

    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket.id);
      connectedRef.current = true;
      // Send userId to server to mark as online
      socket.emit('user-online', user.id);
    });

    // Listen for online/offline status changes
    socket.on('user-status', ({ userId, online }) => {
      console.log(`[Socket] User ${userId} ${online ? 'ONLINE' : 'OFFLINE'}`);
      setOnlineUsers(prev => {
        const next = new Map(prev);
        if (online) {
          next.set(userId, true);
        } else {
          next.delete(userId);
        }
        return next;
      });
    });

    socket.on('disconnect', () => {
      console.log('[Socket] Disconnected');
      connectedRef.current = false;
    });

    socket.on('connect_error', (err) => {
      console.error('[Socket] Connection error:', err.message);
    });

    socketRef.current = socket;
    setSocket(socket);

    return () => {
      socket.disconnect();
      socketRef.current = null;
      connectedRef.current = false;
      setSocket(null);
    };
  }, [currentUser]);

  // Check if user is online
  const isUserOnline = (userId) => onlineUsers.has(Number(userId));

  // Get list of online user IDs
  const getOnlineUserIds = () => Array.from(onlineUsers.keys());

  return (
    <SocketContext.Provider value={{ onlineUsers, isUserOnline, getOnlineUserIds, socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within a SocketProvider');
  return context;
};