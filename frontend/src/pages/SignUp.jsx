import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { api } from '../services/api';
import { Navbar } from '../components/Navbar';
import '../output.css';

export const SignUp = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'client'
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/auth/register', formData);
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative">
      <Navbar />

      <div className="max-w-md mx-auto px-4 sm:px-0 z-10">
        <div className="mt-12 flex flex-col items-center animate-fade-in-up">
          <div className="w-full bg-gray-800/50 p-8 rounded-2xl shadow-2xl border border-gray-700 transform transition-all hover:scale-[1.005] hover:shadow-indigo-500/20">
            <div className="flex flex-col items-center mb-8">
              <div className="relative">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Create Account
                </h1>
                <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-pulse-scale" />
              </div>
              <p className="mt-4 text-gray-400">Start your journey with us</p>
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
                  Username
                </label>
                <input
                  type="text"
                  required
                  className="w-full mt-2 px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-400 text-gray-100 transition-all"
                  placeholder="Enter username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>

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

              <div className="group">
                <label className="text-sm font-medium text-gray-300 group-focus-within:text-indigo-400 transition-colors">
                  Role
                </label>
                <select
                  value={formData.role}
                  className="w-full mt-2 px-4 py-3 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-100 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3Ryb2tlPSIjOGE3NmZmIiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiPjxwYXRoIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLXdpZHRoPSIyIiBkPSJNMTkgOWwtNyA3LTctNyIvPjwvc3ZnPg==')] bg-no-repeat bg-[right:1rem_center] bg-[length:1.5em]"
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="client" className="bg-gray-800">Client</option>
                  <option value="freelancer" className="bg-gray-800">Freelancer</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-medium rounded-lg transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-indigo-500/30 active:scale-95"
              >
                Sign Up
              </button>
            </form>


            <div className="text-center mt-6">
              <RouterLink
                to="/login"
                className="text-gray-400 hover:text-indigo-400 transition-colors inline-flex items-center group"
              >
                <span>Already have an account?</span>
                <span className="ml-2 group-hover:underline">Login now</span>
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </RouterLink>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-blob" />
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
      </div>
    </div>
  );
};