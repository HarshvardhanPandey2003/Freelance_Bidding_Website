// backend/src/socket/chat.js
import { Payment } from '../models/Payment.model.js';
import { Message } from '../models/Chat.model.js';

/**
 * Helper: Generate a room name based on two user IDs.
 * The room name is deterministic (sorted lexicographically).
 */
const generateRoomName = (userId1, userId2) => {
  return userId1 < userId2
    ? `chat_${userId1}_${userId2}`
    : `chat_${userId2}_${userId1}`;
};

/**
 * Socket.io chat handler.
 * Expects that socket.user is available from the authentication middleware.
 */
// What exactly this function does is handle chat-related events for authenticated users.
// We use callbacks because to return data back to the client after an event is emitted.
export const chatSocketHandler = (socket) => {
  // Event: "startChat"
  // Data payload: { partnerId }
  // Callback: returns { room, messages } or an error.
  socket.on('startChat', async ({ partnerId }, callback) => {
    try {
      const user = socket.user; // This comes from your JWT-based auth middleware.
      let paymentRecord;

      // Validate that a completed payment record exists between the user and partner.
      if (user.role === 'freelancer') {
        paymentRecord = await Payment.findOne({
          freelancer: user._id,
          client: partnerId,
          status: 'COMPLETED'
        });
      } else if (user.role === 'client') {
        paymentRecord = await Payment.findOne({
          freelancer: partnerId,
          client: user._id,
          status: 'COMPLETED'
        });
      }

      if (!paymentRecord) {
        return callback({
          error: 'No valid payment record exists for this chat.'
        });
      }

      // Generate a unique room name and join the socket to that room.
      const room = generateRoomName(user._id.toString(), partnerId.toString());
      socket.join(room);

      // Optionally, fetch chat history (if messages are persisted).
      const messages = await Message.find({
        $or: [
          { sender: user._id, receiver: partnerId },
          { sender: partnerId, receiver: user._id }
        ]
      }).sort({ timestamp: 1 });

      callback({ room, messages });
    } catch (err) {
      console.error('Error in startChat:', err);
      callback({ error: 'Internal server error.' });
    }
  });

  // Event: "sendMessage"
  // Data payload: { room, partnerId, message }
  // Callback: returns a success or error message.
  // SO here we send the message to the room and get another callback with the message data.
  // Which we store in MongoDB and the emit to the room.
  socket.on('sendMessage', async (data, callback) => {
    try {
      const { room, partnerId, message } = data;
      const user = socket.user;

      if (!room || !partnerId || !message?.trim()) {
        return callback({ error: 'Invalid message data.' });
      }

      // Create and save the new message.
      const newMessage = new Message({
        sender: user._id,
        receiver: partnerId,
        message: message.trim()
      });
      await newMessage.save();

      const payload = {
        sender: user._id,
        message: newMessage.message,
        timestamp: newMessage.timestamp
      };

      // Emit the new message to everyone in the room except the sender.
      socket.to(room).emit('receiveMessage', payload);

      // Optionally, confirm the message was sent to the sender.
      callback({ success: true, message: payload });
    } catch (err) {
      console.error('Error in sendMessage:', err);
      callback({ error: 'Failed to send message.' });
    }
  });
};
