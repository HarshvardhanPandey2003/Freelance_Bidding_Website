//backend/src/utils/io.js
export let io = null;

export const setIO = (instance) => {
  if (io) {
    throw new Error('Socket.io instance already initialized');
  }
  io = instance;
};