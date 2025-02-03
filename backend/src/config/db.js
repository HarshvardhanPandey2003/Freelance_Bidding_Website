// backend/src/config/db.js
import mongoose from 'mongoose';

export const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');
  
};

