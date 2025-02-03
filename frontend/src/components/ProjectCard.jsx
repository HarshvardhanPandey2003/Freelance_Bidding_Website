// src/Pages/ProjectCard.jsx]
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom'; // <-- Added useNavigate import
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import '../output.css';

export const ProjectCard = ({ project, onDelete, onUpdate }) => {
  const { user } = useAuth();
  const navigate = useNavigate(); // <-- Initialize navigate
  const isOwner = user && user._id === project.client;

  // Limit description to the first 10 words with ellipsis if necessary
  const words = project.description.split(' ');
  const limitedDescription = words.length > 10 
    ? words.slice(0, 10).join(' ') + '...'
    : project.description;

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await api.delete(`/api/projects/${project._id}`);
        onDelete(project._id);
      } catch (err) {
        console.error('Error deleting project:', err);
      }
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      const updatedProject = await api.put(`/api/projects/${project._id}`, {
        status: newStatus
      });
      onUpdate(updatedProject.data);
    } catch (err) {
      console.error('Error updating project:', err);
    }
  };

  return (
    <div className="bg-gray-800/50 rounded-2xl p-6 min-h-[200px] h-full flex flex-col transition-shadow duration-300 hover:shadow-lg hover:shadow-indigo-500/30 relative">
      <div className="flex flex-col flex-grow">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-bold text-white pr-8">{project.title}</h3>
          <span
            className={`text-xs font-medium rounded-full px-2 py-1 uppercase ${
              project.status === 'OPEN' ? 'bg-green-500/90 text-white' :
              project.status === 'IN_PROGRESS' ? 'bg-yellow-500/90 text-gray-800' :
              'bg-gray-500/90 text-white'
            }`}
          >
            {project.status}
          </span>
        </div>

        <p className="text-gray-400 mb-4 line-clamp-3 flex-grow">
          {limitedDescription}
        </p>

        {project.skills && project.skills.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-300 mb-2">Required Skills:</h4>
            <ul className="flex flex-wrap gap-2">
              {project.skills.map((skill) => (
                <li
                  key={skill}
                  className="bg-indigo-500/20 text-indigo-300 text-xs font-medium px-2 py-1 rounded-md"
                >
                  {skill}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-auto">
          <div className="flex justify-between items-center text-sm text-gray-400">
            <span>Budget: ${project.budget?.toFixed(2)}</span>
            <span>
              Deadline: {format(new Date(project.deadline), 'MMM dd, yyyy')}
            </span>
          </div>
        </div>
      </div>

      {isOwner && (
        <div className="absolute top-4 right-4 flex gap-2">
          <button 
            onClick={(e) => {
              e.stopPropagation(); // Prevents the outer onClick from firing
              navigate(`/update-project/${project._id}`);
            }} 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Edit
          </button>
          <button 
              onClick={(e) => {
                e.stopPropagation();//This prevents the event from bubbling up to the parent container.
                handleDelete();
              }} 
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Delete
          </button>
        </div>
      )}

    </div>
  );
};
