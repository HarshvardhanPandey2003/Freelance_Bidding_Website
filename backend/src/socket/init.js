// backend/src/socket/init.js
import { socketAuthMiddleware } from '../middleware/socketAuth.middleware.js';
import { chatSocketHandler } from './chat.js';

export const initializeSocket = (io) => {
  // Apply authentication middleware to all socket connections
  io.use(socketAuthMiddleware);

  // Socket.io event listeners
  io.on('connection', (socket) => {
    console.log('New client connected with ID:', socket.id);
    
    // Register chat handler for authenticated sockets
    chatSocketHandler(socket);

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });

    socket.on('newBid', (data) => {
      // Emit bid updates to all connected clients
      io.emit('bidUpdate', data);
    });
  });

  return io;
};
