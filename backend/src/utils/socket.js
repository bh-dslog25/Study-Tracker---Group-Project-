'use strict';

let io = null;
const onlineUsers = new Map(); // userId -> socketId

const initSocket = (server) => {
  const { Server } = require('socket.io');
  
  io = new Server(server, {
    cors: {
      origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Khi user đăng nhập, gửi userId lên
    socket.on('user-online', (userId) => {
      if (userId) {
        onlineUsers.set(Number(userId), socket.id);
        console.log(`[Socket] User ${userId} is ONLINE`);
        io.emit('user-status', { userId: Number(userId), online: true });
      }
    });

    // Khi user disconnect
    socket.on('disconnect', () => {
      let disconnectedUserId = null;
      for (const [uid, sid] of onlineUsers.entries()) {
        if (sid === socket.id) {
          disconnectedUserId = uid;
          onlineUsers.delete(uid);
          break;
        }
      }
      if (disconnectedUserId) {
        console.log(`[Socket] User ${disconnectedUserId} is OFFLINE`);
        io.emit('user-status', { userId: disconnectedUserId, online: false });
      }
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.io chưa được khởi tạo');
  return io;
};

const isUserOnline = (userId) => onlineUsers.has(Number(userId));

const getOnlineUsers = () => {
  return Array.from(onlineUsers.keys());
};

module.exports = { initSocket, getIO, isUserOnline, getOnlineUsers };
