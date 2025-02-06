// backend/src/models/Bid.model.js
import mongoose from 'mongoose';

const bidSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  freelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bidAmount: {
    type: Number,
    required: true,
    min: 0
  },
  message: {
    type: String,
    maxLength: 500
  },
  status: {
    type: String,
    enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
    default: 'PENDING'
  }
}, {
  timestamps: true
});

// Ensure one freelancer can only have one active bid per project
bidSchema.index({ project: 1, freelancer: 1 }, { unique: true });

export const Bid = mongoose.model('Bid', bidSchema);