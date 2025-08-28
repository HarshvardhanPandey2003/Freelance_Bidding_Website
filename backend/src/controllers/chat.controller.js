// File: backend/src/controllers/chat.controller.js
import { Payment } from '../models/Payment.model.js';
import { Message } from '../models/Chat.model.js';

/**
 * GET /api/chats/connections
  Returns a list of users the authenticated user can chat with, based on completed payments.
  It returns this through the payement model, which contains the user IDs and their roles.
  A freelancer gets a list of clients they've completed work for.
 */
export const getChatConnections = async (req, res, next) => {
  try {
    const user = req.user;
    let connections;

    // For freelancers, find completed payments where they are the freelancer.
    if (user.role === 'freelancer') {
      connections = await Payment.find({
        freelancer: user._id,
        status: 'COMPLETED'
      }).populate('client', 'username email');
    }
    // For clients, find completed payments where they are the client.
    else if (user.role === 'client') {
      connections = await Payment.find({
        client: user._id,
        status: 'COMPLETED'
      }).populate('freelancer', 'username email');
    } else {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // This functions returns a formatted list of connections.
    // Which is basically the partner's ID, username, and email.
    const formattedConnections = connections.map((payment) => {
      return {
        partnerId:
          user.role === 'freelancer'
            ? payment.client._id
            : payment.freelancer._id,
        partnerName:
          user.role === 'freelancer'
            ? payment.client.username
            : payment.freelancer.username,
        partnerEmail:
          user.role === 'freelancer'
            ? payment.client.email
            : payment.freelancer.email
      };
    });

    res.status(200).json({
      message: 'Chat connections fetched successfully',
      data: formattedConnections
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/chats/history/:partnerId
 * Retrieves the chat history between the authenticated user and the partner.
 */
export const getChatHistory = async (req, res, next) => {
  try {
    const user = req.user;
    const { partnerId } = req.params;

    // Find messages exchanged between the authenticated user and the partner.
    const messages = await Message.find({
      $or: [
        { sender: user._id, receiver: partnerId },
        { sender: partnerId, receiver: user._id }
      ]
    }).sort({ timestamp: 1 }); // Sort in ascending order

    res.status(200).json({
      message: 'Chat history fetched successfully',
      data: messages
    });
  } catch (error) {
    next(error);
  }
};
