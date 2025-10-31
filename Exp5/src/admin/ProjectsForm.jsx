import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const ProjectsForm = ({ onSaved = () => {} }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('http://localhost:5000/api/portfolio/projects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        const incoming = (response.data.data || []).map(p => ({
          ...p,
          technologiesInput: Array.isArray(p.technologies) ? p.technologies.join(', ') : ''
        }));
        setProjects(incoming);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleProjectChange = (index, field, value) => {
    setProjects(prev => prev.map((project, i) => 
      i === index ? { ...project, [field]: value } : project
    ));
  };

  const handleTechnologiesChange = (index, value) => {
    setProjects(prev => prev.map((project, i) => 
      i === index ? { ...project, technologiesInput: value } : project
    ));
  };

  const addProject = () => {
    const newProject = {
      title: '',
      description: '',
      image: '',
      technologies: [],
      technologiesInput: '',
      githubUrl: '',
      liveUrl: '',
      featured: false,
      status: 'completed'
    };
    setProjects(prev => [...prev, newProject]);
  };

  const removeProject = (index) => {
    setProjects(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('adminToken');
      const payloadProjects = projects.map(({
        _id,
        title,
        description,
        image,
        githubUrl,
        liveUrl,
        featured,
        status,
        technologiesInput
      }) => ({
        title,
        description,
        image,
        githubUrl,
        liveUrl,
        featured,
        status,
        technologies: (technologiesInput || '')
          .split(',')
          .map(t => t.trim())
          .filter(Boolean)
      }));

      const response = await axios.put('http://localhost:5000/api/portfolio/projects', 
        { projects: payloadProjects }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Projects updated successfully!' });
        onSaved();
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update projects' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Message Display */}
      {message.text && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </motion.div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Manage Projects</h2>
        <button
          type="button"
          onClick={addProject}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium"
        >
          Add New Project
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {projects.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500 mb-4">No projects added yet</p>
            <button
              type="button"
              onClick={addProject}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
            >
              Add Your First Project
            </button>
          </div>
        ) : (
          projects.map((project, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
            >
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-lg font-medium text-gray-800">
                  Project #{index + 1}
                </h3>
                <div className="flex items-center space-x-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={project.featured}
                      onChange={(e) => handleProjectChange(index, 'featured', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-600">Featured</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => removeProject(index)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Title
                    </label>
                    <input
                      type="text"
                      value={project.title}
                      onChange={(e) => handleProjectChange(index, 'title', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter project title"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Image URL
                    </label>
                    <input
                      type="url"
                      value={project.image}
                      onChange={(e) => handleProjectChange(index, 'image', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="https://example.com/project-image.jpg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={project.status}
                      onChange={(e) => handleProjectChange(index, 'status', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="completed">Completed</option>
                      <option value="in-progress">In Progress</option>
                      <option value="planned">Planned</option>
                    </select>
                  </div>
                </div>

                {/* Links and Technologies */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      GitHub URL
                    </label>
                    <input
                      type="url"
                      value={project.githubUrl}
                      onChange={(e) => handleProjectChange(index, 'githubUrl', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="https://github.com/username/project"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Live Demo URL
                    </label>
                    <input
                      type="url"
                      value={project.liveUrl}
                      onChange={(e) => handleProjectChange(index, 'liveUrl', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="https://your-project.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Technologies (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={project.technologiesInput ?? ''}
                      onChange={(e) => handleTechnologiesChange(index, e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="React, Node.js, MongoDB, Express"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Description
                </label>
                <textarea
                  value={project.description}
                  onChange={(e) => handleProjectChange(index, 'description', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Describe your project, its features, and what makes it special..."
                  required
                />
              </div>

              {/* Technologies Preview */}
              {(() => {
                const techs = (project.technologiesInput || '')
                  .split(',')
                  .map(t => t.trim())
                  .filter(Boolean);
                return techs.length > 0 ? (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Technologies Preview:</p>
                  <div className="flex flex-wrap gap-2">
                    {techs.map((tech, techIndex) => (
                      <span
                        key={techIndex}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
                ) : null;
              })()}
            </motion.div>
          ))
        )}

        {projects.length > 0 && (
          <div className="flex justify-end">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-medium shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </div>
              ) : (
                'Update Projects'
              )}
            </motion.button>
          </div>
        )}
      </form>
    </div>
  );
};

export default ProjectsForm;
