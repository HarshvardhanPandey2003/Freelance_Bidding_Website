// backend/src/app.js - Updated with better IO instance management
import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { Server as SocketIOServer } from 'socket.io';
import authRouter from './routes/auth.routes.js';
import projectRouter from './routes/project.routes.js';
import { connectDB } from './config/db.js';
import bidRouter from './routes/bid.routes.js';
import profileRouter from './routes/profile.routes.js';
import paymentRouter from './routes/payment.routes.js';
import chatRoutes from './routes/chat.routes.js';
import { initializeSocket } from './socket/init.js';

const app = express();
const httpServer = createServer(app);

// Initialize Socket.io with CORS configuration
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'DELETE', 'PUT'],
    credentials: true,
  },
});

// Store io instance globally to prevent race conditions
let ioInstance = null;

// Initialize socket with authentication and event handlers
const initializeSocketIO = async () => {
  ioInstance = await initializeSocket(io);
  return ioInstance;
};

// Safe getter for IO instance with race condition protection
export const getIO = () => {
  if (!ioInstance) {
    console.warn('Socket.io instance not initialized yet');
    return null;
  }
  return ioInstance;
};

// Export the io instance for usage in other modules
export { io };

// Apply global middleware
app.use(cookieParser());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Register API routes
app.use('/api/auth', authRouter);
app.use('/api/projects', projectRouter);
app.use('/api/bids', bidRouter);
app.use('/api/profile', profileRouter);
app.use('/api/payments', paymentRouter);
app.use('/api/chats', chatRoutes);

// Connect to the database then start the HTTP server
connectDB().then(async () => {
  // Initialize socket.io before starting server
  await initializeSocketIO();
  
  httpServer.listen(5000, () =>
    console.log('Server running on port 5000 with Socket.io initialized')
  );
});
