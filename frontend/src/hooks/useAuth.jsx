//frontend/src/useAuth.jsx
import { useState, useEffect } from 'react';
import { api } from '../services/api';
//This function is used in App.jsx and 
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const { data } = await api.get('/api/auth/me');
      setUser(data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };
//So, when a component uses useAuth, this useEffect runs once, calling checkAuth to verify if the user is logged in.
  useEffect(() => {
    checkAuth();
  }, []);

  return { user, loading, checkAuth };
};