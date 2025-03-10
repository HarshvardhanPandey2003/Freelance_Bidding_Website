// frontend/src/hooks/useAuth.jsx
import { useState, useEffect, createContext, useContext, useMemo } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

// AuthProvider creates the AuthContext and provides user, loading, and checkAuth() to all child components (like Navbar).
// This way, any component inside App can use useAuth() to access user or call checkAuth()
//  without needing to manually pass data down through props.const 
 useProvideAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    console.log('useProvideAuth: Fetching user data...');
    try {
      const response = await api.get('/api/auth/me');
      const userData = response.data;
      setUser({
        _id: userData.id || userData._id,
        ...userData,
      });
      return userData;
    } catch (error) {
      console.error('useProvideAuth: Failed to fetch user data:', error);
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return { user, loading, checkAuth };
};

// Provider component uses the internal hook once and supplies the result via context.
export const AuthProvider = ({ children }) => {
  const auth = useProvideAuth();
  const memoizedAuth = useMemo(() => auth, [auth.user, auth.loading]);
//By using useMemo, we ensure that auth is only updated when user or loading
//  actually changes, preventing unnecessary re-renders.otherwise it will rerender everytime we refresh it 

if (memoizedAuth.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <span className="text-white text-lg">Loading...</span>
      </div>
    );
  }
  return (
    <AuthContext.Provider value={memoizedAuth}>
      {children}
    </AuthContext.Provider>
  );
};


// Consumer hook is now exported as useAuth
export const useAuth = () => useContext(AuthContext);
