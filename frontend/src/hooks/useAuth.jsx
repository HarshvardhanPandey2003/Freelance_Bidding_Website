// frontend/src/hooks/useAuth.jsx
import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { createContext, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { user, loading } = useAuth(); // Use your custom hook here
  
  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
// frontend/src/hooks/useAuth.jsx
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    console.log('useAuth: Fetching user data...');
    try {
      const response = await api.get('/api/auth/me');
      const userData = response.data;
      // Normalize user data format
      setUser({
        _id: userData.id || userData._id,
        ...userData
      });
      return userData;
    } catch (error) {
      console.error('useAuth: Failed to fetch user data:', error);
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []); // Add dependencies if needed

  return { user, loading, checkAuth }; // Expose checkAuth for manual refreshes
};
export const useAuthContext = () => useContext(AuthContext);
