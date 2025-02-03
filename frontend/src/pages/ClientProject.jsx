    // frontend/src/pages/ClientProject.jsx
    import { useState, useEffect } from 'react';
    import { useParams, useNavigate } from 'react-router-dom';
    import { format } from 'date-fns';
    import { api } from '../services/api';
    import { useAuth } from '../hooks/useAuth';

    const ClientProject = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProject = async () => {
        try {
            const { data } = await api.get(`/api/projects/${id}`);
            setProject(data);
        } catch (err) {
            console.error('Error fetching project:', err);
            setError('Failed to load project details.');
        } finally {
            setLoading(false);
        }
        };

        fetchProject();
    }, [id]);

    if (loading) {
        return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-500"></div>
        </div>
        );
    }

    if (error) {
        return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex justify-center items-center">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
            </div>
        </div>
        );
    }

    if (!project) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <button 
            onClick={() => navigate(-1)} 
            className="text-indigo-500 hover:underline mb-4"
            >
            &larr; Back
            </button>

            <div className="bg-gray-800/50 rounded-2xl p-6">
            <div className="mb-4">
                <h1 className="text-3xl font-bold">{project.title}</h1>
                <span
                className={`text-xs font-medium rounded-full px-2 py-1 uppercase 
                    ${project.status === 'OPEN' 
                    ? 'bg-green-500/90 text-white' 
                    : project.status === 'IN_PROGRESS' 
                    ? 'bg-yellow-500/90 text-gray-800' 
                    : 'bg-gray-500/90 text-white'}`}
                >
                {project.status}
                </span>
            </div>

            <div className="mb-4">
                <h2 className="text-xl font-semibold mb-2">Description</h2>
                <p className="text-gray-400">{project.description}</p>
            </div>

            {project.skills && project.skills.length > 0 && (
                <div className="mb-4">
                <h2 className="text-xl font-semibold mb-2">Required Skills</h2>
                <ul className="flex flex-wrap gap-2">
                    {project.skills.map((skill) => (
                    <li 
                        key={skill} 
                        className="bg-indigo-500/20 text-indigo-300 text-sm font-medium px-2 py-1 rounded"
                    >
                        {skill}
                    </li>
                    ))}
                </ul>
                </div>
            )}

            <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-4">
                <span>Budget: ${project.budget?.toFixed(2)}</span>
                <span>Deadline: {format(new Date(project.deadline), 'MMM dd, yyyy')}</span>
            </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-md p-6 rounded-lg mt-6">
            <h2 className="text-2xl font-bold mb-4">Bids</h2>
            <p className="text-gray-400">No Bids added by freelancers</p>
            </div>
        </div>
        </div>
    );
    };

    export default ClientProject;
