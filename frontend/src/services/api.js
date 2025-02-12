// frontend/src/services/api.js

import axios from 'axios';
//Axios is like a messenger between your frontend and backend. 
// It helps send requests (like GET, POST) to your backend API and brings back responses.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true
});

// Payment initiation function
export const initiatePayment = async ({ projectId, freelancerId, amount }) => {
  console.log({ projectId, freelancerId, amount });
  const numericAmount = Number(amount);
  if (isNaN(numericAmount) || numericAmount <= 0) {
    throw new Error('Invalid amount value');
  }

  const response = await api.post('/api/payments/initiate', {
    projectId,
    freelancerId,
    amount: numericAmount
  });  return response.data;
};

api.interceptors.response.use(
  response => response,
  error => {
    return Promise.reject(error.response?.data?.error || 'Something went wrong');
  }
);


