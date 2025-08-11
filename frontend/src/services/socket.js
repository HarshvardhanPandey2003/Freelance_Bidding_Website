// frontend/src/services/socket.js
import { io } from 'socket.io-client';

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// This variable will hold our socket instance.
let socket;
export const initSocket = (token) => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
      auth: {
        token,
      },
      extraHeaders: {
        withCredentials: true,
      },
    });
  }
  return socket;
};

// Getter to retrieve the socket instance.
export const getSocket = () => socket;

// For backwards compatibility, if socket hasn't been initialized via initSocket,
// immediately set it up with a default connection.
if (!socket) {
  socket = io(SOCKET_URL, {
    withCredentials: true,
    extraHeaders: {
      withCredentials: true,
    },
  });
}

// Export the socket as a named export as well as the default export.
export { socket };
export default socket;