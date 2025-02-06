// frontend/src/services/socket.js
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  withCredentials: true,
  extraHeaders: {
    'withCredentials': true
  }
});

export default socket;