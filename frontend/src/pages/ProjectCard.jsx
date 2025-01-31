import { format } from 'date-fns';
import '../output.css'; // Import Tailwind CSS

export const ProjectCard = ({ project }) => (
  <div className="bg-gray-800/50 rounded-2xl p-6 transition-transform duration-300 hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/30 h-full flex flex-col"> {/* Added flex flex-col and h-full */}
    <div className="flex flex-col flex-grow"> {/* Added flex-grow to content area */}
      <div className="flex items-start justify-between mb-4"> {/* Title and Chip container */}
        <h3 className="text-xl font-bold text-white">{project.title}</h3>
        <span className={`text-xs font-medium rounded-full px-2 py-1 uppercase ${
          project.status === 'OPEN' ? 'bg-green-500 text-white' :
          project.status === 'IN_PROGRESS' ? 'bg-yellow-500 text-gray-800' :
          'bg-gray-500 text-white'
        }`}>
          {project.status}
        </span>
      </div>
      <p className="text-gray-400 mb-4 line-clamp-3"> {/* Used line-clamp-3 for description */}
        {project.description}
      </p>
      <div className="mt-auto"> {/* Pushes budget/deadline to bottom */}
        <div className="flex justify-between text-sm text-gray-400"> {/* Budget/Deadline container */}
          <span>Budget: ${project.budget.toFixed(2)}</span>
          <span>Deadline: {format(new Date(project.deadline), 'MMM dd, yyyy')}</span>
        </div>
      </div>
    </div>
  </div>
);