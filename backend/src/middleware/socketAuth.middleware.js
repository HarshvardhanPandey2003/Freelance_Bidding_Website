// backend/src/middleware/socketAuth.middleware.js
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import { User } from '../models/User.model.js';

export const socketAuthMiddleware = async (socket, next) => {
  try {
    // Read cookie header from socket handshake
    const cookieHeader = socket.handshake.headers.cookie;
    if (!cookieHeader) {
      return next(new Error('Authentication error: No cookies found'));
    }
    
    // Parse cookies
    const cookies = cookie.parse(cookieHeader);
    const token = cookies.jwt; // Make sure this matches your actual cookie name
    
    if (!token) {
      return next(new Error('Authentication error: Token not found in cookies'));
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user by ID
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new Error('User not found'));
    }
    
    // Attach user to socket for use in handlers
    socket.user = user;
    next();
  } catch (error) {
    console.error('Socket authentication error:', error);
    next(new Error('Authentication failed'));
  }
};
