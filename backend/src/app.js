// backend/src/app.js
import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRouter from './routes/auth.routes.js';
import projectRouter from './routes/project.routes.js';
import { connectDB } from './config/db.js';
import { protect } from './middleware/auth.middleware.js';

const app = express();
const httpServer = createServer(app);

// Socket.IO Setup , adding the socket headers to the HTTP server
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true
  }
});

// Socket.IO Authentication Middleware
io.use(async (socket, next) => {
  try {
    const fakeReq = {
      cookies: socket.handshake.headers.cookie 
        ? Object.fromEntries(new URLSearchParams(socket.handshake.headers.cookie.replace(/; /g, '&')))
        : {}
    };
    
    await protect(fakeReq, {}, (err) => {
      if (err) return next(new Error('Not authorized'));
      socket.user = fakeReq.user;
      next();
    });
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

// Socket.IO Connection Handler
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.user._id} (${socket.user.role})`);
  
  // Join project-specific room (will be implemented later)
  socket.on('join_project', (projectId) => {
    socket.join(`project_${projectId}`);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.user._id}`);
  });
});

// Attach io instance to app for controller access
app.locals.io = io;

// Rest of your existing middleware and routes
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRouter);
app.use('/api/projects', projectRouter);

// Modified server startup
connectDB().then(async () => {
  httpServer.listen(5000, () => {
    console.log('Server & Socket.IO running on port 5000');
  });
});