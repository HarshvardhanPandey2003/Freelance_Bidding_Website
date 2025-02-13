//frontedn/src/pages/FreelancerProfile.jsx
import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';

export const FreelancerProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    image: '',
    name: '',
    description: '',
    links: { github: '', linkedin: '' },
    resume: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/api/profile/freelancer');
        setProfile(response.data);
        setFormData(response.data);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  const handleEdit = () => {
    setEditing(true);
  };

  const handleSave = async () => {
    try {
      await api.post('/api/profile/freelancer', formData);
      setEditing(false);
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLinkChange = (e, linkType) => {
    setFormData((prev) => ({
      ...prev,
      links: {
        ...prev.links,
        [linkType]: e.target.value
      }
    }));
  };

  if (loading) return <div className="text-center text-gray-400">Loading...</div>;
  if (!profile) return <div className="text-center text-gray-400">Profile not found</div>;

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-8">Freelancer Profile</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col items-center">
          <img
            src={formData.image}
            alt="Profile"
            className="w-40 h-40 rounded-full border-2 border-indigo-500"
          />
          {editing ? (
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full mt-2 px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400 text-gray-100"
            />
          ) : (
            <p className="text-gray-300 mt-4">{formData.name}</p>
          )}
        </div>
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-300">Description</label>
            {editing ? (
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full mt-2 px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400 text-gray-100 resize-none"
                rows={4}
              />
            ) : (
              <p className="text-gray-400">{formData.description}</p>
            )}
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-300">GitHub Link</label>
            {editing ? (
              <input
                type="text"
                name="github"
                value={formData.links.github}
                onChange={(e) => handleLinkChange(e, 'github')}
                className="w-full mt-2 px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400 text-gray-100"
              />
            ) : (
              <p className="text-gray-400">GitHub: {formData.links.github}</p>
            )}
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-300">LinkedIn Link</label>
            {editing ? (
              <input
                type="text"
                name="linkedin"
                value={formData.links.linkedin}
                onChange={(e) => handleLinkChange(e, 'linkedin')}
                className="w-full mt-2 px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400 text-gray-100"
              />
            ) : (
              <p className="text-gray-400">LinkedIn: {formData.links.linkedin}</p>
            )}
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-300">Resume URL</label>
            {editing ? (
              <input
                type="text"
                name="resume"
                value={formData.resume}
                onChange={handleChange}
                className="w-full mt-2 px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400 text-gray-100"
              />
            ) : (
              <p className="text-gray-400">Resume: {formData.resume}</p>
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-center mt-8">
        {editing ? (
          <button
            onClick={handleSave}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-indigo-500/30 active:scale-95 transition-all"
          >
            Save
          </button>
        ) : (
          <button
            onClick={handleEdit}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-indigo-500/30 active:scale-95 transition-all"
          >
            Edit
          </button>
        )}
      </div>
    </div>
  );
};