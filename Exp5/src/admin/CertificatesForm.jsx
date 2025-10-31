import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const CertificatesForm = ({ onSaved = () => {} }) => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('http://localhost:5000/api/portfolio/certificates', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        const incoming = (response.data.data || []).map(c => ({
          ...c,
          skillsInput: Array.isArray(c.skills) ? c.skills.join(', ') : ''
        }));
        setCertificates(incoming);
      }
    } catch (error) {
      console.error('Error fetching certificates:', error);
    }
  };

  const handleCertificateChange = (index, field, value) => {
    setCertificates(prev => prev.map((cert, i) => 
      i === index ? { ...cert, [field]: value } : cert
    ));
  };

  const addCertificate = () => {
    const newCertificate = {
      title: '',
      issuer: '',
      date: '',
      description: '',
      image: '',
      credentialUrl: '',
      skills: []
    };
    setCertificates(prev => [...prev, newCertificate]);
  };

  const removeCertificate = (index) => {
    setCertificates(prev => prev.filter((_, i) => i !== index));
  };

  const handleSkillsChange = (index, value) => {
    setCertificates(prev => prev.map((cert, i) => 
      i === index ? { ...cert, skillsInput: value } : cert
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('adminToken');
      const payloadCertificates = certificates.map(({ title, issuer, date, description, image, credentialUrl, skillsInput }) => ({
        title,
        issuer,
        date,
        description,
        image,
        credentialUrl,
        skills: (skillsInput || '')
          .split(',')
          .map(s => s.trim())
          .filter(Boolean)
      }));

      const response = await axios.put('http://localhost:5000/api/portfolio/certificates', 
        { certificates: payloadCertificates }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Certificates updated successfully!' });
        onSaved();
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update certificates' 
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
        <h2 className="text-xl font-semibold text-gray-800">Manage Certificates</h2>
        <button
          type="button"
          onClick={addCertificate}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium"
        >
          Add New Certificate
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {certificates.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500 mb-4">No certificates added yet</p>
            <button
              type="button"
              onClick={addCertificate}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
            >
              Add Your First Certificate
            </button>
          </div>
        ) : (
          certificates.map((certificate, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
            >
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-lg font-medium text-gray-800">
                  Certificate #{index + 1}
                </h3>
                <button
                  type="button"
                  onClick={() => removeCertificate(index)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Certificate Title
                    </label>
                    <input
                      type="text"
                      value={certificate.title}
                      onChange={(e) => handleCertificateChange(index, 'title', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g., AWS Certified Solutions Architect"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Issuing Organization
                    </label>
                    <input
                      type="text"
                      value={certificate.issuer}
                      onChange={(e) => handleCertificateChange(index, 'issuer', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g., Amazon Web Services"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date Obtained
                    </label>
                    <input
                      type="date"
                      value={certificate.date}
                      onChange={(e) => handleCertificateChange(index, 'date', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Certificate Image URL
                    </label>
                    <input
                      type="url"
                      value={certificate.image}
                      onChange={(e) => handleCertificateChange(index, 'image', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="https://example.com/certificate.jpg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Credential URL (optional)
                    </label>
                    <input
                      type="url"
                      value={certificate.credentialUrl}
                      onChange={(e) => handleCertificateChange(index, 'credentialUrl', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="https://verify-certificate.com/123"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Related Skills (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={certificate.skills.join(', ')}
                      onChange={(e) => handleSkillsChange(index, e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="AWS, Cloud Computing, DevOps"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={certificate.description}
                  onChange={(e) => handleCertificateChange(index, 'description', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Describe what this certification covers and its significance..."
                />
              </div>

              {/* Skills Preview */}
              {certificate.skills.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Skills Preview:</p>
                  <div className="flex flex-wrap gap-2">
                    {certificate.skills.map((skill, skillIndex) => (
                      <span
                        key={skillIndex}
                        className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ))
        )}

        {certificates.length > 0 && (
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
                'Update Certificates'
              )}
            </motion.button>
          </div>
        )}
      </form>
    </div>
  );
};

export default CertificatesForm;
