// frontend/src/pages/CreateClientProfile.jsx
import React, { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';

export const CreateClientProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    image: '',
    name: '',
    company: '',
    description: '',
    links: { website: '' }
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
      await api.post('/api/profile/client', formData);
      navigate('/client-profile');
    } catch (error) {
      console.error('Failed to create profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800/50 rounded-xl p-6">
      <h2 className="text-2xl font-bold mb-4">Create Client Profile</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-300">Profile Image URL</label>
          <input
            type="text"
            name="image"
            value={formData.image}
            onChange={handleChange}
            className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-2"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-300">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-2"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-300">Company</label>
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleChange}
            className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-2"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-300">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-2"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-300">Website Link</label>
          <input
            type="text"
            name="website"
            value={formData.links.website}
            onChange={(e) => setFormData((prev) => ({ ...prev, links: { ...prev.links, website: e.target.value } }))}
            className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-2"
          />
        </div>
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors shadow-sm hover:shadow-md active:scale-95"
        >
          {loading ? 'Creating...' : 'Create Profile'}
        </button>
        <Link
          to="/dashboard"
          className="text-indigo-400 hover:text-indigo-300 ml-4"
        >
          Cancel
        </Link>
      </form>
    </div>
  );
};