// frontend/src/services/socket.js
import { io } from 'socket.io-client';
// Connects to the backend’s websocket server with credentials.
const socket = io('http://localhost:5000', {
  withCredentials: true,
  extraHeaders: {
    'withCredentials': true
  }
});

export default socket;