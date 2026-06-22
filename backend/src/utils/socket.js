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
      if (!userId) return;
      const uid = Number(userId);

      // Remove any PREVIOUS socket entry for this user (login from a new tab/session)
      for (const [existingUid, existingSid] of onlineUsers.entries()) {
        if (existingUid === uid && existingSid !== socket.id) {
          onlineUsers.delete(existingUid);
          console.log(`[Socket] Removed stale entry for user ${uid} (old socket ${existingSid})`);
        }
      }

      // Only emit if user actually changed online state
      const wasOnline = onlineUsers.has(uid);
      onlineUsers.set(uid, socket.id);
      if (!wasOnline) {
        console.log(`[Socket] User ${uid} is ONLINE (socket ${socket.id})`);
        socket.broadcast.emit('user-status', { userId: uid, online: true });
      } else {
        console.log(`[Socket] User ${uid} refreshed socket (socket ${socket.id})`);
      }
    });

    socket.on('disconnect', (reason) => {
      const disconnectedUserIds = [];
      for (const [uid, sid] of onlineUsers.entries()) {
        if (sid === socket.id) {
          disconnectedUserIds.push(uid);
          onlineUsers.delete(uid);
        }
      }
      for (const uid of disconnectedUserIds) {
        console.log(`[Socket] User ${uid} is OFFLINE (socket ${socket.id})`);
        socket.broadcast.emit('user-status', { userId: uid, online: false });
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

// Emit new join request notification to the specific teacher who owns the class
const emitNewJoinRequest = (requestData) => {
  if (!io) return;
  const { teacherId } = requestData;
  // Emit to all sockets, the frontend will filter by teacherId
  io.emit('new-join-request', requestData);
};

module.exports = { initSocket, getIO, isUserOnline, getOnlineUsers, emitNewJoinRequest };
