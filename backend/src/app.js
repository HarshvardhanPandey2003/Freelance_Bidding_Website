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
import paymentRouter from './routes/payment.routes.js'; // Import


const app = express();
const httpServer = createServer(app);

// Initialize socket.io
const io = new SocketIOServer(httpServer, {
  // Configured with CORS options. It specifically allows connections from http://localhost:5173 
  cors: {
    origin: 'http://localhost:5173', // Allow requests from this URL
    methods: ['GET', 'POST','DELETE','PUT'],
    credentials: true,
  },
});

// Export the io instance
export { io };

// Sets up event listeners to handle new connections, disconnections, and a custom event (newBid → bidUpdate).
io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });

  socket.on('newBid', (data) => {
    io.emit('bidUpdate', data); // Emit to all connected clients
  });
});

app.use(cookieParser());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

//Routes
app.use('/api/auth', authRouter);
app.use('/api/projects', projectRouter);
app.use('/api/bids', bidRouter);
app.use('/api/profile', profileRouter);
app.use('/api/payments', paymentRouter); // Payment endpoints

// Connect DB and start server
connectDB().then(() => {
  httpServer.listen(5000, () => console.log('Server running on port 5000'));
}); 