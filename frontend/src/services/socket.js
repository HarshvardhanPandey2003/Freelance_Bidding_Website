// frontend/src/services/socket.js
import { io } from 'socket.io-client';

const SOCKET_URL = window.location.origin;

let socket = null;  // Just a storage variable

// Create a socket with this token IF none exists , used when socket connection is needed
export const initSocket = (token) => { 
  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
      auth: { token },
      extraHeaders: { withCredentials: true },
    });
  }
  return socket;
};

export const getSocket = () => socket;  // Get current socket

export const setSocket = (socketInstance) => {  // Store this socket in the SocketContext so that others can access it
  socket = socketInstance;
};

export { socket };
export default socket;
