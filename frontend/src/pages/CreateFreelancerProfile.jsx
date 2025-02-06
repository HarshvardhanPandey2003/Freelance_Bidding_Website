// frontend/src/pages/CreateFreelancerProfile.jsx
import React, { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';


export const CreateFreelancerProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    image: '',
    name: '',
    description: '',
    links: { github: '', linkedin: '' },
    resume: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/profile/freelancer', formData);
      navigate('/freelancer-profile');
    } catch (error) {
      console.error('Failed to create profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-md mx-auto px-4 sm:px-0">
        <div className="mt-12 flex flex-col items-center animate-fade-in-up">
          <div className="w-full bg-gray-800/50 p-8 rounded-2xl shadow-2xl border border-gray-700 transform transition-all hover:scale-[1.005] hover:shadow-indigo-500/20">
            <div className="flex flex-col items-center mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Create Profile
              </h1>
            </div>
  
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="group">
                <label className="text-sm font-medium text-gray-300">Profile Image URL</label>
                <input
                  type="text"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  className="w-full mt-2 px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400 text-gray-100"
                />
              </div>
  
              <div className="group">
                <label className="text-sm font-medium text-gray-300">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full mt-2 px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400 text-gray-100"
                />
              </div>
  
              <div className="group">
                <label className="text-sm font-medium text-gray-300">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full mt-2 px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400 text-gray-100"
                />
              </div>
  
              <div className="group">
                <label className="text-sm font-medium text-gray-300">GitHub Link</label>
                <input
                  type="text"
                  name="github"
                  value={formData.links.github}
                  onChange={(e) => setFormData((prev) => ({ ...prev, links: { ...prev.links, github: e.target.value } }))}
                  className="w-full mt-2 px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400 text-gray-100"
                />
              </div>
  
              <div className="group">
                <label className="text-sm font-medium text-gray-300">LinkedIn Link</label>
                <input
                  type="text"
                  name="linkedin"
                  value={formData.links.linkedin}
                  onChange={(e) => setFormData((prev) => ({ ...prev, links: { ...prev.links, linkedin: e.target.value } }))}
                  className="w-full mt-2 px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400 text-gray-100"
                />
              </div>
  
              <div className="group">
                <label className="text-sm font-medium text-gray-300">Resume URL</label>
                <input
                  type="text"
                  name="resume"
                  value={formData.resume}
                  onChange={handleChange}
                  className="w-full mt-2 px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400 text-gray-100"
                />
              </div>
  
              <button
                type="submit"
                className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-medium rounded-lg transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-indigo-500/30 active:scale-95"
              >
                {loading ? 'Creating...' : 'Create Profile'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
