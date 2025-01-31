import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import '../output.css';

export const CreateProject = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    deadline: '',
    skills: [],
  });
  const [availableSkills, setAvailableSkills] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [formErrors, setFormErrors] = useState({
    title: false,
    description: false,
    budget: false,
    deadline: false,
    skills: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);


// This function needs to run only once when the component is first rendered.
// useEffect with an empty dependency array ([]) ensures the function runs only on the initial render.
// Because we want that as soon as we get to the page the data should be fetched.Like we dont hav eto click any button for that 
  useEffect(() => {
    //The frontend makes a GET request to http://localhost:5000/api/skills to fetch the list of skills.
    // This happens in the useEffect hook of the CreateProject component
    const fetchSkills = async () => {
      try {
        const response = await api.get('/api/skills');
        setAvailableSkills(response.data);
      } catch (err) {
        console.error('Error fetching skills:', err);
      }
    };
    fetchSkills();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const validateForm = (data) => {
    return {
      title: !data.title.trim(),
      description: !data.description.trim(),
      budget: isNaN(parseFloat(data.budget)) || parseFloat(data.budget) <= 0,
      deadline: !data.deadline,
      skills: data.skills.length === 0,
    };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      deadline: e.target.value,
    }));
  };
  // This is an event handler that runs when the user selects a skill from the dropdown.

  const handleSkillSelect = (skill) => {
    if (!formData.skills.some((s) => s._id === skill._id)) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skill],
      }));
    }
    setSearchTerm('');
    setShowDropdown(false);
    setFormErrors((prev) => ({ ...prev, skills: false }));
  };

  const removeSkill = (skillId) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill._id !== skillId),
    }));
  };

  const filteredSkills = availableSkills.filter((skill) =>
    skill.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm(formData);
    setFormErrors(errors);
    if (Object.values(errors).some(Boolean)) return;
    setLoading(true);

    try {
      await api.post('/api/projects', {
        ...formData,
        skills: formData.skills.map((skill) => skill._id),
        budget: parseFloat(formData.budget),
        deadline: dayjs(formData.deadline).toISOString(),
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8">
      <div className="max-w-md mx-auto px-4 sm:px-0">
        <div className="bg-gray-800/50 p-8 rounded-2xl shadow-2xl border border-gray-700">
          <h1 className="text-3xl font-bold text-white mb-4">Create New Project</h1>
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-300">Project Title</label>
              <input
                type="text"
                name="title"
                onChange={handleInputChange}
                value={formData.title}
                className={`w-full mt-2 px-4 py-3 bg-gray-700 border rounded-lg text-white ${formErrors.title ? 'border-red-500' : 'border-gray-600'}`}
                placeholder="Enter project title"
              />
              {formErrors.title && <p className="text-red-500 text-sm mt-1">Title is required</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300">Description</label>
              <textarea
                name="description"
                onChange={handleInputChange}
                value={formData.description}
                className={`w-full mt-2 px-4 py-3 bg-gray-700 border rounded-lg text-white ${formErrors.description ? 'border-red-500' : 'border-gray-600'}`}
                rows={4}
                placeholder="Enter description"
              ></textarea>
              {formErrors.description && <p className="text-red-500 text-sm mt-1">Description is required</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300">Budget ($)</label>
              <input
                type="number"
                name="budget"
                onChange={handleInputChange}
                value={formData.budget}
                className={`w-full mt-2 px-4 py-3 bg-gray-700 border rounded-lg text-white ${formErrors.budget ? 'border-red-500' : 'border-gray-600'}`}
                placeholder="Enter budget"
                min="0.01"
                step="0.01"
              />
              {formErrors.budget && <p className="text-red-500 text-sm mt-1">Budget must be greater than 0</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300">Required Skills</label>
              <div className="relative mt-2" ref={dropdownRef}>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.skills.map(skill => (
                    <div 
                      key={skill._id}
                      className="flex items-center bg-indigo-500/20 text-indigo-200 px-3 py-1 rounded-full"
                    >
                      <span>{skill.name}</span>
                      <button
                        type="button"
                        onClick={() => removeSkill(skill._id)}
                        className="ml-2 hover:text-indigo-100"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white ${
                    formErrors.skills ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="Search for skills..."
                />
                {showDropdown && searchTerm && (
                  <div className="absolute z-50 w-full mt-1 max-h-48 overflow-auto bg-gray-700 rounded-lg shadow-lg border border-gray-600">
                    {filteredSkills.length > 0 ? (
                      filteredSkills.map(skill => (
                        <div
                          key={skill._id}
                          onClick={() => handleSkillSelect(skill)}
                          className="px-4 py-2 hover:bg-gray-600 cursor-pointer text-white"
                        >
                          {skill.name}
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-gray-400">No skills found</div>
                    )}
                  </div>
                )}
              </div>
              {formErrors.skills && <p className="text-red-500 text-sm mt-1">At least one skill is required</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300">Deadline</label>
              <input
                type="date"
                name="deadline"
                onChange={handleDateChange}
                value={formData.deadline}
                className={`w-full mt-2 px-4 py-3 bg-gray-700 border rounded-lg text-white ${formErrors.deadline ? 'border-red-500' : 'border-gray-600'}`}
              />
              {formErrors.deadline && <p className="text-red-500 text-sm mt-1">Deadline is required</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-medium rounded-lg transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-indigo-500/30 active:scale-95 disabled:bg-gray-500"
            >
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};