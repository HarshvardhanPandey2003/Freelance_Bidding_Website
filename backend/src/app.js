// backend/src/app.js
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
    //origin: process.env.FRONTEND_URL || 'http://localhost:5173', for production
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'DELETE', 'PUT'],
    credentials: true,
  },
});

// Initialize socket with authentication and event handlers
initializeSocket(io);

// Export the io instance for usage in other modules if needed
export { io };

// Apply global middleware
app.use(cookieParser());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
// app.use(cors({ 
//   origin: process.env.FRONTEND_URL || 'http://localhost:5173', 
//   credentials: true 
// }));
app.use(express.json());

// Register API routes
app.use('/api/auth', authRouter);
app.use('/api/projects', projectRouter);
app.use('/api/bids', bidRouter);
app.use('/api/profile', profileRouter);
app.use('/api/payments', paymentRouter);
app.use('/api/chats', chatRoutes);

// Connect to the database then start the HTTP server
connectDB().then(() => {
  httpServer.listen(5000, () =>
    console.log('Server running on port 5000')
  );
});
