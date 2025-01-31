import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import '../output.css';

export const Navbar = () => {
  const { user, checkAuth } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/api/auth/logout');
      await checkAuth(); // Wait for auth check to complete
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };
  // So to create a feature you have to start by creating a new function
  const handleBrandClick = (e) => {
    if (!user) {
      e.preventDefault();
      navigate('/');
    }
  };

  return (
    <nav className="bg-gray-800/70 backdrop-blur-md border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link 
              to={user ? "/dashboard" : "/"}
              onClick={handleBrandClick}
              className="text-white font-bold text-xl tracking-wide"
            >
              Freelance<span className="text-indigo-400">Bidding</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md transition-colors shadow-sm hover:shadow-md active:scale-95"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-md transition-colors shadow-sm hover:shadow-md active:scale-95"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};