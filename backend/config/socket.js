const jwt = require('jsonwebtoken');
const User = require('../models/User');

const initializeSocket = (io) => {
  // Authentication middleware for Socket.IO
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;

      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('name avatar role');

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`User connected: ${socket.user.name} (${socket.userId})`);

    // Update online status
    await User.findByIdAndUpdate(socket.userId, {
      isOnline: true,
      lastSeen: new Date()
    });

    // Join user's personal room (for receiving messages)
    socket.join(socket.userId);

    // Broadcast online status to others
    socket.broadcast.emit('userOnline', { userId: socket.userId });

    // --- Chat Events ---

    // Join a conversation room
    socket.on('joinConversation', (conversationId) => {
      socket.join(`conversation:${conversationId}`);
      console.log(`${socket.user.name} joined conversation: ${conversationId}`);
    });

    // Leave a conversation room
    socket.on('leaveConversation', (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
    });

    // Handle new message (real-time broadcast)
    socket.on('sendMessage', (data) => {
      const { conversationId, message } = data;

      // Broadcast to all users in the conversation room except sender
      socket.to(`conversation:${conversationId}`).emit('newMessage', {
        conversationId,
        message: {
          ...message,
          sender: {
            _id: socket.userId,
            name: socket.user.name,
            avatar: socket.user.avatar
          }
        }
      });

      // Also notify the other user's personal room (for chat list update)
      if (message.recipientId) {
        socket.to(message.recipientId).emit('conversationUpdated', {
          conversationId,
          lastMessage: {
            text: message.text,
            sender: socket.userId,
            timestamp: new Date()
          }
        });
      }
    });

    // Typing indicator
    socket.on('typing', (data) => {
      const { conversationId, isTyping } = data;
      socket.to(`conversation:${conversationId}`).emit('userTyping', {
        conversationId,
        userId: socket.userId,
        userName: socket.user.name,
        isTyping
      });
    });

    // --- Community Events ---

    // Join community room
    socket.on('joinCommunity', () => {
      socket.join('community');
    });

    // New community post broadcast
    socket.on('newCommunityPost', (post) => {
      socket.to('community').emit('communityPostCreated', post);
    });

    // --- Disconnect ---

    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.user.name}`);

      // Update offline status
      await User.findByIdAndUpdate(socket.userId, {
        isOnline: false,
        lastSeen: new Date()
      });

      socket.broadcast.emit('userOffline', {
        userId: socket.userId,
        lastSeen: new Date()
      });
    });
  });

  return io;
};

module.exports = initializeSocket;
