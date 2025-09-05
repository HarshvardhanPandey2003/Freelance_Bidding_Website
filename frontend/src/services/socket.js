// frontend/src/services/socket.js
import { io } from 'socket.io-client';

const SOCKET_PATH = '/socket.io';

let socket = null;  // module-scoped storage

// Create a socket with this token IF none exists
export const initSocket = (token) => {
  if (!socket) {
    // Do not pass an explicit URL — let it default to current origin.
    socket = io(undefined, {
      path: SOCKET_PATH,
      withCredentials: true,
      auth: { token },
      transports: ['websocket'],
      timeout: 20000,
    });
  }
  return socket;
};

export const getSocket = () => socket;

export const setSocket = (socketInstance) => {
  socket = socketInstance;
};

export { socket };
export default socket;
