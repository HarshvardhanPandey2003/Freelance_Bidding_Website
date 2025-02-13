// Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Navbar } from '../components/Navbar';
import '../output.css';
import { useAuth } from '../hooks/useAuth'; // use our consumer hook


export const Login = () => {
  // Here we define the state with variables and functions
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { checkAuth } = useAuth(); // get checkAuth from context

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/auth/login', formData);
      // Refresh auth state by calling checkAuth so the provider knows the user is logged in
      await checkAuth();
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Navbar />
  
      <div className="max-w-md mx-auto px-4 sm:px-0">
        <div className="mt-12 flex flex-col items-center animate-fade-in-up">
          <div className="w-full bg-gray-800/50 p-8 rounded-2xl shadow-2xl border border-gray-700 transform transition-all hover:scale-[1.005] hover:shadow-indigo-500/20">
            <div className="flex flex-col items-center mb-8">
              <div className="relative">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Login
                </h1>
                <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-pulse-scale" />
              </div>
            </div>
  
            {error && (
              <div className="mb-6 p-3 bg-red-400/10 border border-red-400/30 rounded-lg flex items-center space-x-2 animate-shake">
                <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-red-400 text-sm">{error}</span>
              </div>
            )}
  
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="group">
                <label className="text-sm font-medium text-gray-300 group-focus-within:text-indigo-400 transition-colors">
                  Email
                </label>
                <input
                  type="email"
                  required
                  className="w-full mt-2 px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-400 text-gray-100 transition-all"
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
  
              <div className="group">
                <label className="text-sm font-medium text-gray-300 group-focus-within:text-indigo-400 transition-colors">
                  Password
                </label>
                <input
                  type="password"
                  required
                  className="w-full mt-2 px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-400 text-gray-100 transition-all"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
  
              <button
                type="submit"
                className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-medium rounded-lg transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-indigo-500/30 active:scale-95"
              >
                Login
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};