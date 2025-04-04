// frontend/src/hooks/useAuth.jsx
import {
  useState,
  useEffect,
  createContext,
  useContext,
  useMemo,
} from "react";
import { api } from "../services/api";

const AuthContext = createContext();

// Properly declared hook using const
const useProvideAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    console.log("useProvideAuth: Fetching user data...");
    try {
      const response = await api.get("/api/auth/me");
      const userData = response.data;
      setUser({
        _id: userData.id || userData._id,
        ...userData,
      });
      return userData;
    } catch (error) {
      console.error("useProvideAuth: Failed to fetch user data:", error);
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
  const memoizedAuth = useMemo(
    () => auth,
    [auth.user, auth.loading]
  ); // Ensures that auth is updated only when user or loading changes.

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

// Documentation on efficiency improvements:
// Without AuthProvider, every component would need to fetch user data individually,
// leading to redundant API calls and inconsistent state. Instead, AuthProvider ensures:
// ✅ Global state management → user state is available everywhere.
// ✅ Fewer API calls → Fetches user data once instead of in every component.
// ✅ Better performance → Uses useMemo() to prevent unnecessary re-renders.
