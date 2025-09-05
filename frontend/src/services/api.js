// frontend/src/services/api.js
//Axios is like a messenger between your frontend and backend. 
// It helps send requests (like GET, POST) to your backend API and brings back responses.
import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',   // relative path -> works with Vite proxy & Ingress
  withCredentials: true,
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
// New helper: Fetch chat connections for the logged-in user
export const getChatConnections = async () => {
  const response = await api.get('/api/chats/connections');
  return response.data;
};

// New helper: Fetch chat history with a specific partner
export const getChatHistory = async (partnerId) => {
  const response = await api.get(`/api/chats/history/${partnerId}`);
  return response.data;
};
api.interceptors.response.use(
  response => response,
  error => {
    return Promise.reject(error.response?.data?.error || 'Something went wrong');
  }
);


