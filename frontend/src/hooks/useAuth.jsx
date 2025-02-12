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
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      console.log('useAuth: Fetching user data...');
      try {
        const response = await api.get('/api/auth/me');
        const userData = response.data; 
        // Normalize: if userData.id exists, assign it to _id for consistency
        if (userData.id && !userData._id) {
          userData._id = userData.id;
        }
        console.log('useAuth: Fetched user:', userData);
        setUser(userData);
      } catch (error) {
        console.error('useAuth: Failed to fetch user data:', );
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, loading };
};

export const useAuthContext = () => useContext(AuthContext);
