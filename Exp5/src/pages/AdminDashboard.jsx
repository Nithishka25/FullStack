import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import HomeForm from '../admin/HomeForm.jsx';
import AboutForm from '../admin/AboutForm.jsx';
import ProjectsForm from '../admin/ProjectsForm.jsx';
import SkillsForm from '../admin/SkillsForm.jsx';
import CertificatesForm from '../admin/CertificatesForm.jsx';
import ContactForm from '../admin/ContactForm.jsx';
import Home from '../sections/Home.jsx';
import About from '../sections/About.jsx';
import Projects from '../sections/Projects.jsx';
import Skills from '../sections/Skills.jsx';
import Certificates from '../sections/Certificates.jsx';
import Contact from '../sections/Contact.jsx';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  // Check if user is authenticated admin
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const role = localStorage.getItem('userRole');
    
    if (!token || role !== 'admin') {
      navigate('/admin-login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userRole');
    navigate('/admin-login');
  };

  const renderActivePreview = () => {
    switch (activeTab) {
      case 'home':
        return <Home />;
      case 'about':
        return <About />;
      case 'projects':
        return <Projects />;
      case 'skills':
        return <Skills />;
      case 'certificates':
        return <Certificates />;
      case 'contact':
        return <Contact />;
      default:
        return <Home />;
    }
  };

  const tabs = [
    { id: 'home', name: 'Home', icon: '🏠' },
    { id: 'about', name: 'About', icon: '👤' },
    { id: 'projects', name: 'Projects', icon: '💼' },
    { id: 'skills', name: 'Skills', icon: '⚡' },
    { id: 'certificates', name: 'Certificates', icon: '🏆' },
    { id: 'contact', name: 'Contact', icon: '📞' }
  ];

  const renderActiveForm = () => {
    switch (activeTab) {
      case 'home':
        return <HomeForm onSaved={() => setIsEditing(false)} />;
      case 'about':
        return <AboutForm onSaved={() => setIsEditing(false)} />;
      case 'projects':
        return <ProjectsForm onSaved={() => setIsEditing(false)} />;
      case 'skills':
        return <SkillsForm onSaved={() => setIsEditing(false)} />;
      case 'certificates':
        return <CertificatesForm onSaved={() => setIsEditing(false)} />;
      case 'contact':
        return <ContactForm onSaved={() => setIsEditing(false)} />;
      default:
        return <HomeForm onSaved={() => setIsEditing(false)} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
              <span className="ml-3 px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                Admin Mode
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditing((prev) => !prev)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors border ${
                  isEditing
                    ? 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'
                    : 'bg-purple-600 text-white border-purple-600 hover:bg-purple-700'
                }`}
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditing(false)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Preview Portfolio
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Logout
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Portfolio Sections</h2>
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <motion.button
                    key={tab.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-purple-100 text-purple-700 border-l-4 border-purple-500'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-xl">{tab.icon}</span>
                    <span>{tab.name}</span>
                  </motion.button>
                ))}
              </nav>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg p-6 mt-6"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-medium transition-colors">
                  Backup Data
                </button>
                <button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-lg font-medium transition-colors">
                  Export Portfolio
                </button>
                <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium transition-colors">
                  View Analytics
                </button>
              </div>
            </motion.div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 capitalize">
                  Manage {activeTab}
                </h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Last updated:</span>
                  <span className="text-sm font-medium text-gray-700">
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Dynamic Content */}
              <div className="min-h-[500px]">
                {isEditing ? (
                  renderActiveForm()
                ) : (
                  <div className="pb-8">
                    {renderActivePreview()}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Success/Error Toast would go here */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <svg className="animate-spin h-6 w-6 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-gray-700">Saving changes...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
