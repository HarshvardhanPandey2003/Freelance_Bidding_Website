// frontend/src/components/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import { useEffect, useState } from 'react';
import '../output.css';

export const Navbar = () => {
  const { user, checkAuth } = useAuth();
  const navigate = useNavigate();
  const [profileExists, setProfileExists] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        let response;
        if (user.role === 'freelancer') {
          response = await api.get('/api/profile/freelancer');
        } else if (user.role === 'client') {
          response = await api.get('/api/profile/client');
        }
        setProfileExists(true);
      } catch (error) {
        setProfileExists(false);
      } finally {
        setLoadingProfile(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await api.post('/api/auth/logout');
      // Wait for auth check to complete
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

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
              <>
                {loadingProfile ? (
                  <span>Loading profile...</span>
                ) : profileExists ? (
                  <Link
                    to={user.role === 'freelancer' ? '/freelancer-profile' : '/client-profile'}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-md transition-colors shadow-sm hover:shadow-md active:scale-95"
                  >
                    Profile
                  </Link>
                ) : (
                  <Link
                    to={user.role === 'freelancer' ? '/create-freelancer-profile' : '/create-client-profile'}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-md transition-colors shadow-sm hover:shadow-md active:scale-95"
                  >
                    Create Profile
                  </Link>
                )}
                {/* Added Payments Button */}
                <Link
                  to="/payments"
                  className="bg-green-400 hover:bg-green-500 text-white font-medium py-2 px-4 rounded-md transition-colors shadow-sm hover:shadow-md active:scale-95"
                >
                  Payments
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md transition-colors shadow-sm hover:shadow-md active:scale-95"
                >
                  Logout
                </button>
              </>
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