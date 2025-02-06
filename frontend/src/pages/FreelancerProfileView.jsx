// frontend/src/pages/FreelancerProfileView.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';

export const FreelancerProfileView = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get(`/api/profile/freelancer-profile/${id}`);
        setProfile(response.data);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        setError('Failed to fetch profile. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
  
    if (id) {
      fetchProfile();
    }
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!profile) return <div>Profile not found</div>;

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-8">Freelancer Profile</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col items-center">
          <img
            src={profile.image}
            alt="Profile"
            className="w-48 h-48 rounded-full border-2 border-indigo-500"
          />
          <p className="text-gray-300 mt-4">{profile.name}</p>
        </div>
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-300">Description</label>
            <p className="text-gray-400">{profile.description}</p>
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-300">GitHub Link</label>
            <p className="text-gray-400">GitHub: {profile.links.github}</p>
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-300">LinkedIn Link</label>
            <p className="text-gray-400">LinkedIn: {profile.links.linkedin}</p>
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-300">Resume URL</label>
            <p className="text-gray-400">Resume: {profile.resume}</p>
          </div>
        </div>
      </div>
    </div>
  );
};