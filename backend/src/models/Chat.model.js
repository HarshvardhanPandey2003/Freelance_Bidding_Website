// File: backend/src/models/Chat.model.js
import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true,
    maxLength: 1000
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

export const Message = mongoose.model('Message', messageSchema);
