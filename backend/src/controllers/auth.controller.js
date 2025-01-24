// backend/src/controllers/auth.controller.js
// SO here we define the function for Registration,login and Logout 
import jwt from 'jsonwebtoken';
import { User } from '../models/User.model.js';

// Define a function of how to create a token you'll be using this to generate JWT Token
const createToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' });

export const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    //This line is to identify dublicates and throw an error if found one 
    //'$or' means either the username or email matches the 
    if (await User.findOne({ $or: [{ email }, { username }] })) {
      return res.status(400).json({ error: 'User already exists' });
    }//Here we used await because you were returning a value 

    //Once thats verified then we create a new object which is the user 
    const user = await User.create({ username, email, password, role });
    //Also create a new Token for it and attach it to the response 
    const token = createToken(user._id);
    res.cookie('jwt', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });
//The JSON response is used for client-side logic.(This would be used for UI responses)
// It provides the client with useful information about the user (e.g., their id, username, and role
    res.json({ id: user._id, username, role });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.checkPassword(password))) {
      throw new Error('Invalid credentials');
    }

    const token = createToken(user._id);
    
    res.cookie('jwt', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000
    });

    res.json({ 
      id: user._id, 
      username: user.username, 
      role: user.role 
    });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

export const logout = (req, res) => {
  res.clearCookie('jwt');
  res.json({ message: 'Logged out' });
};