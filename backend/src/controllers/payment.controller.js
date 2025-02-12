// File: backend/src/controllers/payment.controller.js
import asyncHandler from '../utils/asyncHandler.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { Payment } from '../models/Payment.model.js';
import { io } from '../app.js';
import { Project } from '../models/Project.model.js';

// Initialize Razorpay instance
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ==================================
// INITIATE PAYMENT
// ==================================
// File: backend/src/controllers/payment.controller.js
export const initiatePayment = asyncHandler(async (req, res) => {
  const { projectId, freelancerId, amount } = req.body;

  // Create Razorpay order (amount in paise)
  const options = {
    amount: amount * 100, // converting INR to paise
    currency: 'INR',
    receipt: `receipt_order_${Date.now()}`,
    payment_capture: 1, // auto-capture enabled
  };

  const order = await razorpayInstance.orders.create(options);

  // Instead of creating a Payment record now, just return the order
  res.status(201).json({
    success: true,
    order, // Order contains id and other details for the checkout
  });
});

// ==================================
// CONFIRM PAYMENT (Webhook Endpoint)
// ==================================
// File: backend/src/controllers/payment.controller.js
export const confirmPayment = asyncHandler(async (req, res) => {
  // Extract payment details from the request body
  const { razorpayPaymentId, razorpayOrderId, razorpaySignature, paymentMethod, projectId, freelancerId, amount } = req.body;

  // Compute the expected signature using the key_secret.
  // Razorpay expects the signature to be HMAC-SHA256 of "orderId|paymentId"
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  // If the computed signature does not match the provided signature, reject the request.
  if (expectedSignature !== razorpaySignature) {
    return res.status(400).json({ success: false, message: 'Payment verification failed' });
  }

  // Create a new Payment record only when payment is verified as successful.
  const paymentRecord = await Payment.create({
    project: projectId,
    client: req.user._id, // Assuming req.user is available (from protect middleware)
    freelancer: freelancerId,
    amount, // Use the actual amount (in INR)
    currency: 'INR',
    status: 'COMPLETED',
    razorpayOrderId,
    paymentMethod: paymentMethod || 'card',
    razorpayPaymentId, // Store the Razorpay payment id
  });

  // Optionally, update the project status if needed.
  const project = await Project.findById(projectId);
  if (project && project.status === 'OPEN') {
    project.status = 'IN_PROGRESS';
    await project.save();
  }

  // Emit a real-time event (if using Socket.io)
  io.emit('paymentUpdate', { paymentId: paymentRecord._id, status: 'COMPLETED' });

  res.status(200).json({ success: true, payment: paymentRecord });
});

// ==================================
// GET PAYMENT HISTORY
// ==================================
export const getPaymentHistory = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  const payments = await Payment.find({
    $or: [
      { client: userId },    
      { freelancer: userId }
    ]
  })
  .populate('project', 'title description') 
  .populate('client', 'name email')       
  .populate('freelancer', 'name email')     
  .sort({ createdAt: -1 });                

  res.status(200).json({
    success: true,
    count: payments.length,
    payments
  });
});
  