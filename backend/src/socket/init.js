// backend/src/socket/init.js - Updated disconnect handler
import { socketAuthMiddleware } from '../middleware/socketAuth.middleware.js';
import { Project } from '../models/Project.model.js';
import mongoose from 'mongoose';
import { chatSocketHandler } from './chat.js';


export const initializeSocket = (io) => {
  io.use(socketAuthMiddleware);

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
      // Add validation for ObjectId format
      if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
        socket.emit('error', { message: 'Invalid project ID format' });
        return;
      }

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
    socket.on('disconnect', () => {
      // Clean up any rooms the user was in
      if (socket.currentProject) {
        socket.leave(`project:${socket.currentProject}`);
        console.log(`User ${socket.user.username} left project room ${socket.currentProject} on disconnect`);
        socket.currentProject = null;
      }
      
      console.log(`User ${socket.user.username} disconnected:`, socket.id);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  return io;
};
