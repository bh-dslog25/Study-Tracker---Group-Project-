import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState(new Map()); // userId -> true
  const socketRef = useRef(null);
  const connectedRef = useRef(false);

  useEffect(() => {
    // Nếu chưa đăng nhập, không kết nối socket
    if (!user || !user.id) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        connectedRef.current = false;
        setOnlineUsers(new Map());
      }
      return;
    }

    // Nếu đã kết nối rồi, không kết nối lại
    if (connectedRef.current && socketRef.current) {
      return;
    }

    // Tạo kết nối socket mới
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });

    socket.on('connect', () => {
      console.log('[Socket] Đã kết nối:', socket.id);
      connectedRef.current = true;
      // Gửi userId lên server để đánh dấu online
      socket.emit('user-online', user.id);
    });

    // Lắng nghe sự thay đổi trạng thái online/offline
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
      console.log('[Socket] Đã ngắt kết nối');
      connectedRef.current = false;
    });

    socket.on('connect_error', (err) => {
      console.error('[Socket] Lỗi kết nối:', err.message);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
      connectedRef.current = false;
    };
  }, [user?.id]);

  // Kiểm tra user có online không
  const isUserOnline = (userId) => onlineUsers.has(Number(userId));

  // Lấy danh sách IDs online
  const getOnlineUserIds = () => Array.from(onlineUsers.keys());

  return (
    <SocketContext.Provider value={{ onlineUsers, isUserOnline, getOnlineUserIds }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket phải được đặt bên trong SocketProvider');
  return context;
};