  //src/pages/ClientDashboard.jsx
  import { useEffect, useState } from 'react';
  import { useNavigate } from 'react-router-dom';
  import { useAuth } from '../hooks/useAuth';
  import { ProjectCard } from '../components/ProjectCard';
  import { api } from '../services/api';

  export const ClientDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
      const fetchProjects = async () => {
        try {
          const { data } = await api.get('/api/projects');
          console.log("Fetched Projects:", data);  // ✅ Debugging: Check API response
          setProjects(data);
        } catch (err) {
          console.error("Error fetching projects:", err);
          setError('Failed to load projects');
        } finally {
          setLoading(false);
        }
      };
    
      fetchProjects();
    }, []);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-gray-800/50 backdrop-blur-md p-6 rounded-lg mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Welcome back, {user?.username}
                </h1>
                <p className="text-gray-400">
                  Manage your active projects and proposals
                </p>
              </div>
              <button
                onClick={() => navigate('/create-project')}
                className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-md transition-colors shadow-sm hover:shadow-md active:scale-95"
              >
                New Project
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <h2 className="text-2xl font-bold text-white mb-4">Your Projects</h2>

          {loading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : projects.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {projects.map((project) => (
                <div
                key={project._id}
                onClick={() => navigate(`/client-project/${project._id}`)}
                className="hover:shadow-lg hover:shadow-indigo-500/30 cursor-pointer"
              >
                <ProjectCard project={project} />
              </div>
                ))}
            </div>
          ) : (
            <div className="bg-gray-800/50 backdrop-blur-md p-6 rounded-lg text-center">
              <p className="text-gray-400 mb-4">
                No projects found. Get started by creating your first project!
              </p>
              <button
                onClick={() => navigate('/create-project')}
                className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-md transition-colors border border-indigo-500 hover:border-indigo-600 shadow-sm hover:shadow-md active:scale-95"
              >
                Create Project
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };