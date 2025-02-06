// let io = null;

// export const getIO = () => {
//   return io;
// };

// export const initIO = (server) => {
//   const { Server } = require('socket.io');
//   io = new Server(server, {
//     cors: {
//       origin: 'http://localhost:5173', // Update if needed
//       methods: ['GET', 'POST'],
//       credentials: true,
//     },
//   });

//   io.on('connection', (socket) => {
//     console.log('Client connected');
//     socket.on('disconnect', () => {
//       console.log('Client disconnected');
//     });
//   });

//   return io;
// };