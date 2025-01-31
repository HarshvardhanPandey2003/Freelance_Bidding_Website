import { format } from 'date-fns';
import '../output.css'; // Import Tailwind CSS

export const ProjectCard = ({ project }) => {
  return (
    <div className="bg-gray-800/50 rounded-2xl p-6 min-h-[200px] h-full flex flex-col transition-shadow duration-300 hover:shadow-lg hover:shadow-indigo-500/30">
      <div className="flex flex-col flex-grow"> {/* Content area expands */}
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-bold text-white">{project.title}</h3>
          <span
            className={`text-xs font-medium rounded-full px-2 py-1 uppercase ${
              project.status === 'OPEN' ? 'bg-green-500 text-white' :
              project.status === 'IN_PROGRESS' ? 'bg-yellow-500 text-gray-800' :
              'bg-gray-500 text-white'
            }`}
          >
            {project.status}
          </span>
        </div>
        <p className="text-gray-400 mb-4 line-clamp-3 flex-grow"> {/* Description expands */}
          {project.description}
        </p>

        <div className="mt-auto"> {/* Footer at bottom */}
          <div className="flex justify-between items-center text-sm text-gray-400"> {/* Aligned items vertically */}
            <span>Budget: ${project.budget?.toFixed(2) || 'N/A'}</span> {/* Handle missing budget */}
            <span>
              Deadline:{' '}
              {project.deadline ? format(new Date(project.deadline), 'MMM dd, yyyy') : 'N/A'}
            </span> {/* Handle missing deadline */}
          </div>
        </div>
      </div>
    </div>
  );
};
