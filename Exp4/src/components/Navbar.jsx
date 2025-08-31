// src/components/Navbar.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-md shadow-sm z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <span className="text-2xl font-bold text-indigo-600">MyPortfolio</span>

        {/* Menu Links */}
        <ul className="hidden md:flex items-center gap-6">
          <li>
            <a href="#home" className="text-gray-800 hover:text-indigo-600">
              Home
            </a>
          </li>
          <li>
            <a href="#about" className="text-gray-800 hover:text-indigo-600">
              About
            </a>
          </li>
          <li>
            <a href="#projects" className="text-gray-800 hover:text-indigo-600">
              Projects
            </a>
          </li>
          <li>
            <a href="#skills" className="text-gray-800 hover:text-indigo-600">
              Skills
            </a>
          </li>
          <li>
            <a
              href="#certificates"
              className="text-gray-800 hover:text-indigo-600"
            >
              Certificates
            </a>
          </li>
          <li>
            <a href="#contact" className="text-gray-800 hover:text-indigo-600">
              Contact
            </a>
          </li>
        </ul>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
