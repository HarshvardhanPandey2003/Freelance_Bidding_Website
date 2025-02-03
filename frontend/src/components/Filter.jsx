// frontend/src/components/Filter.jsx
import { useState } from 'react';

export const Filter = ({ onApplyFilters }) => {
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [skills, setSkills] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const filters = {
      minBudget: minBudget.trim(),
      maxBudget: maxBudget.trim(),
      deadline: deadline.trim(),
      skills: skills.trim(), // expected as a comma-separated string
    };
    onApplyFilters(filters);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-gray-700 rounded-lg mb-6">
      <div className="flex flex-wrap gap-4">
        <div className="flex flex-col">
          <label className="text-sm text-gray-300">Min Budget</label>
          <input
            type="number"
            value={minBudget}
            onChange={(e) => setMinBudget(e.target.value)}
            placeholder="e.g. 500"
            className="p-2 rounded-md"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm text-gray-300">Max Budget</label>
          <input
            type="number"
            value={maxBudget}
            onChange={(e) => setMaxBudget(e.target.value)}
            placeholder="e.g. 2000"
            className="p-2 rounded-md"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm text-gray-300">Deadline Before</label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="p-2 rounded-md"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm text-gray-300">Skills</label>
          <input
            type="text"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="Comma-separated skills"
            className="p-2 rounded-md"
          />
        </div>
      </div>
      <div className="mt-4">
        <button
          type="submit"
          className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-md"
        >
          Apply Filters
        </button>
      </div>
    </form>
  );
};
