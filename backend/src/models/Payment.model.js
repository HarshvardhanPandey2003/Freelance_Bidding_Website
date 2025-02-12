// File: backend/src/models/Payment.model.js
import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'FAILED'],
      default: 'PENDING',
    },
    razorpayOrderId: {
      type: String,
      required: true,
    },
    paymentMethod: {
      type: String, // e.g., 'card'
    },
  },
  { timestamps: true }
);

export const Payment = mongoose.model('Payment', paymentSchema);
