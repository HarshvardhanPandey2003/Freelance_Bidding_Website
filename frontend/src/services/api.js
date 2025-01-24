// STEP 2: Create API Service Foundation
// File: frontend/src/services/api.js

import axios from 'axios';

// Base configuration
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true
});

// Request interceptor skeleton
api.interceptors.request.use((config) => {
  // We'll add JWT logic later
  return config;
});

// Response interceptor skeleton
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // We'll handle errors later
    return Promise.reject(error);
  }
);

// Temporary test function - delete this later
export const testConnection = async () => {
  try {
    const response = await api.get('/auth/ping');
    console.log('Connection test:', response.data);
  } catch (error) {
    console.error('Connection failed:', error);
  }
};