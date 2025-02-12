import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { ProjectCard } from '../components/ProjectCard';
import { Filter } from '../components/Filter';
import { useNavigate } from 'react-router-dom';

export const FreelancerDashboard = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  // Memoize fetchProjects to prevent unnecessary recreations
  const fetchProjects = useCallback(async (filterParams = {}) => {
    setLoading(true);
    try {
      const query = new URLSearchParams(filterParams).toString();
      const response = await api.get(`/api/projects/open?${query}`);
      setProjects(response.data);
      setError(null);
    } catch (err) {
      setError(err);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Function to force a refresh
  const refreshProjects = useCallback(() => {
    setLastRefresh(Date.now());
  }, []);

  // Update projects when filters or lastRefresh changes
  useEffect(() => {
    fetchProjects(filters);
  }, [filters, lastRefresh, fetchProjects]);

  // Optional: Set up polling to refresh projects periodically
  useEffect(() => {
    const intervalId = setInterval(() => {
      refreshProjects();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(intervalId);
  }, [refreshProjects]);

  const handleApplyFilters = (appliedFilters) => {
    const activeFilters = {};
    Object.keys(appliedFilters).forEach((key) => {
      if (appliedFilters[key]) {
        activeFilters[key] = appliedFilters[key];
      }
    });
    setFilters(activeFilters);
  };

  const handleProjectClick = async (projectId) => {
    try {
      // Verify project still exists before navigating
      const response = await api.get(`/api/projects/${projectId}`);
      if (response.data) {
        navigate(`/freelance-project/${projectId}`);
      } else {
        // If project doesn't exist, refresh the list
        refreshProjects();
      }
    } catch (err) {
      // If there's an error (e.g., project not found), refresh the list
      refreshProjects();
    }
  };

  return (
    // Outer container with the same background gradient and minimum height as the login page
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Freelancer Dashboard</h1>
          <button
            onClick={refreshProjects}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Refresh Projects
          </button>
        </div>

        <Filter onApplyFilters={handleApplyFilters} />

        {loading ? (
          <div className="text-white">Loading...</div>
        ) : error ? (
          <div className="text-red-500">Error fetching projects: {error}</div>
        ) : projects.length === 0 ? (
          <div className="text-white mt-4">No results found</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
            {projects.map((project) => (
              <div
                key={project._id}
                onClick={() => handleProjectClick(project._id)}
                className="cursor-pointer"
              >
                <ProjectCard project={project} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};