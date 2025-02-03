// frontend/src/pages/FreelancerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ProjectCard } from '../components/ProjectCard';
import { Filter } from '../components/Filter';
import { useNavigate } from 'react-router-dom';

export const FreelancerDashboard = () => {
  const navigate = useNavigate();
  // State to store the list of projects
  const [projects, setProjects] = useState([]);
  // State to store the current filter values
  const [filters, setFilters] = useState({});
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch projects from the backend based on the current filters
  const fetchProjects = async (filterParams = {}) => {
    setLoading(true);
    try {
      // Create a query string from the filterParams object
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
  };

  // Update filters and trigger a new fetch whenever filters change
  useEffect(() => {
    fetchProjects(filters);
  }, [filters]);

  // Handler to receive filters from the Filter component
  const handleApplyFilters = (appliedFilters) => {
    // Remove any empty filter keys so that the backend doesn't receive unnecessary parameters
    const activeFilters = {};
    Object.keys(appliedFilters).forEach((key) => {
      if (appliedFilters[key]) {
        activeFilters[key] = appliedFilters[key];
      }
    });
    setFilters(activeFilters);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-white">Freelancer Dashboard</h1>
      {/* Filter component for freelancers */}
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
                onClick={() => navigate(`/freelance-project/${project._id}`)}
                className="cursor-pointer"
              >
                <ProjectCard project={project} />
              </div>
            ))}
        </div>
      )}
    </div>
  );
};
