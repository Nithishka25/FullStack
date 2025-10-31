import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Home from '../sections/Home.jsx';
import About from '../sections/About.jsx';
import Projects from '../sections/Projects.jsx';
import Skills from '../sections/Skills.jsx';
import Certificates from '../sections/Certificates.jsx';
import Contact from '../sections/Contact.jsx';

const VisitorDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear any stored session artifacts
    localStorage.removeItem('userRole');
    localStorage.removeItem('token');
    localStorage.removeItem('adminToken');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Visitor Navbar */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-800">Portfolio</h1>
              <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                Visitor Mode
              </span>
            </div>
            
            {/* Navigation Links */}
            <div className="hidden md:flex space-x-8">
              <a href="#home" className="text-gray-700 hover:text-blue-600 transition-colors">Home</a>
              <a href="#about" className="text-gray-700 hover:text-blue-600 transition-colors">About</a>
              <a href="#projects" className="text-gray-700 hover:text-blue-600 transition-colors">Projects</a>
              <a href="#skills" className="text-gray-700 hover:text-blue-600 transition-colors">Skills</a>
              <a href="#certificates" className="text-gray-700 hover:text-blue-600 transition-colors">Certificates</a>
              <a href="#contact" className="text-gray-700 hover:text-blue-600 transition-colors">Contact</a>
            </div>

            {/* Logout Button */}
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
      </nav>

      {/* Portfolio Sections */}
      <div className="space-y-0">
        <section id="home">
          <Home />
        </section>
        
        <section id="about">
          <About />
        </section>
        
        <section id="projects">
          <Projects />
        </section>
        
        <section id="skills">
          <Skills />
        </section>
        
        <section id="certificates">
          <Certificates />
        </section>
        
        <section id="contact">
          <Contact />
        </section>
      </div>

      {/* Read-only Notice */}
      <div className="fixed bottom-4 right-4 z-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg"
        >
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm">Read-only mode</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VisitorDashboard;
