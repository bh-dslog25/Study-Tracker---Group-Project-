import React, { createContext, useContext, useEffect, useState, useRef, useMemo } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
  const [onlineUsers, setOnlineUsers] = useState(new Map()); // userId -> true
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);
  const mountedRef = useRef(false);
  const currentUserIdRef = useRef(null);

  // Stable current user detection (no re-render loops)
  const currentUser = useMemo(() => {
    const storedUser = localStorage.getItem('user_info') || localStorage.getItem('admin_info');
    return storedUser ? JSON.parse(storedUser) : null;
  }, []); // Only compute once on mount

  // Poll for user changes (login/logout) — run once on mount
  useEffect(() => {
    let socket = null;

    const connectForUser = (uid) => {
      // Always disconnect previous socket first
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      if (!uid) {
        setSocket(null);
        setOnlineUsers(new Map());
        currentUserIdRef.current = null;
        return;
      }

      currentUserIdRef.current = uid;
      socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        withCredentials: true,
      });

      socket.on('connect', () => {
        console.log('[Socket] Connected:', socket.id, 'user:', uid);
        socket.emit('user-online', uid);
      });

      socket.on('user-status', ({ userId, online }) => {
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

      socket.on('connect_error', (err) => {
        // Silently ignore connection errors during cleanup/navigation
      });

      socket.on('disconnect', () => {
        // Clear ref so checkUser will reconnect on next tick
        if (currentUserIdRef.current === uid) {
          currentUserIdRef.current = null;
        }
      });

      socketRef.current = socket;
      setSocket(socket);
    };

    const checkUser = () => {
      const storedUser = localStorage.getItem('user_info') || localStorage.getItem('admin_info');
      const parsed = storedUser ? JSON.parse(storedUser) : null;
      const uid = parsed?.id || null;
      const prevUid = currentUserIdRef.current;
      if (prevUid !== uid) {
        console.log(`[Socket] User session changed: ${prevUid} -> ${uid}`);
        connectForUser(uid);
      }
    };

    // Initial connect
    checkUser();

    // Poll for login/logout changes
    const interval = setInterval(checkUser, 500);
    const handleStorage = () => checkUser();
    window.addEventListener('storage', handleStorage);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorage);
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      currentUserIdRef.current = null;
    };
  }, []);

  const isUserOnline = (userId) => onlineUsers.has(Number(userId));
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
