// backend/src/socket/init.js - Updated with Redis Subscriber
import { socketAuthMiddleware } from '../middleware/socketAuth.middleware.js';
import { Project } from '../models/Project.model.js';
import mongoose from 'mongoose';
import { chatSocketHandler } from './chat.js';
import redisClient from '../config/redis.js';

// Setup Redis subscriber for bid events
// What you're actually doing here is subscribing to Redis channels
// And then emitting events to all connected Socket.io clients through the project rooms
const setupRedisSubscriber = (io) => {
  // Create a separate Redis client for subscribing which makes sure we don't block the main thread
  const subscriber = redisClient.duplicate();
  
  subscriber.connect().then(() => {
    console.log('Redis subscriber connected');
    
    // Subscribe to all project channels
    // When you subscribe to project channels, it internally uses socket.io rooms to emit events
    subscriber.pSubscribe('project:*', (message, channel) => {
      try {
        const { type, data } = JSON.parse(message);
        const projectId = channel.split(':')[1];
        
        console.log(`Redis received ${type} for project ${projectId}`);
        
        // Emit to all Socket.io clients in this server instance
        io.to(`project:${projectId}`).emit(type, data);
        
      } catch (error) {
        console.error('Error processing Redis message:', error);
      }
    });
    
  }).catch(err => {
    console.error('Redis subscriber connection error:', err);
  });
};

export const initializeSocket = (io) => {
  io.use(socketAuthMiddleware);

  // Setup Redis subscriber when you initialize the socket
  setupRedisSubscriber(io);

  io.on('connection', (socket) => {
    console.log(`User ${socket.user.username} connected with ID:`, socket.id);
    
    // Initialize chat socket handlers (existing functionality)
    chatSocketHandler(socket);

    // ==================================
    // BID-RELATED SOCKET HANDLERS
    // ==================================

    // Join project room with authorization
    // **IMPROVED: Better room joining with confirmation**
    socket.on('joinProject', async (projectId) => {
      try {
        if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
          socket.emit('error', { message: 'Invalid project ID format' });
          return;
        }
        // Queries the database to find the project with the given projectId and only fetches client and status fields
        // Uses .lean() for better performance (returns plain JavaScript object instead of Mongoose document)
        const project = await Project.findById(projectId).select('client status').lean();
        if (!project) {
          socket.emit('error', { message: 'Project not found' });
          return;
        }

        // Join the project room
        await socket.join(`project:${projectId}`);
        socket.currentProject = projectId;
        
        console.log(`User ${socket.user.username} joined project room: ${projectId}`);
        
        // **IMPORTANT: Confirm successful join**
        socket.emit('joinedProject', { 
          projectId,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        console.error('Error joining project:', error);
        socket.emit('error', { message: 'Failed to join project room' });
      }
    });

    // Leave project room
    socket.on('leaveProject', (projectId) => {
       // 1. Validate projectId format
      if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
        socket.emit('error', { message: 'Invalid project ID format' });
        return;
      }
      // 2. Check if project exists in database
      socket.leave(`project:${projectId}`);
      if (socket.currentProject === projectId) {
        socket.currentProject = null;
      }
      console.log(`User ${socket.user.username} left project room: ${projectId}`);
      socket.emit('leftProject', { projectId });
    });

    // ==================================
    // GENERIC SOCKET HANDLERS
    // ==================================

    // Handle disconnect - FIX MEMORY LEAK
    // So what this does is when you close the application
    // socket.currentProject still exists in server memory. Socket might still be "joined" to the room
    // thats why we call this when the user disconnects
    socket.on('disconnect', () => {
      
      if (socket.currentProject) {
        socket.leave(`project:${socket.currentProject}`);
        console.log(`User ${socket.user.username} left project room ${socket.currentProject} on disconnect`);
        socket.currentProject = null;
      }
      console.log(`User ${socket.user.username} disconnected:`, socket.id);
    });

      // 3. Only THEN allow user to join the room
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  return io;
};
