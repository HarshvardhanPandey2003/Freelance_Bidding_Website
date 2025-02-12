  // backend/src/models/User.model.js
  import mongoose from 'mongoose';
  import bcrypt from 'bcryptjs';

  const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['client', 'freelancer'], required: true }
  });


  // pre is a Mongoose method used to define middleware that runs before a specific operation (in this case, the save operation).
  userSchema.pre('save', async function(next) {
  //So her we first check if the password is modified or not if no then skip hasing 
  // If yes the proceed with Hashing 
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
    // 'next' : Signals that the middleware has finished, and Mongoose can proceed with saving the document.
  });
  //Methods is a Mongoose feature that allows you to add custom methods to a schema.
  //Like in this case we are just using 
  userSchema.methods.checkPassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  };

  export const User = mongoose.model('User', userSchema);
