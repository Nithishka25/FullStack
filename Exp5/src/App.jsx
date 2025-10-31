import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import RoleSelection from "./components/RoleSelection.jsx";
import VisitorDashboard from "./pages/VisitorDashboard.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import Login from "./auth/Login.jsx";
import Signup from "./auth/Signup.jsx";

// Individual sections for standalone viewing
import Home from "./sections/Home.jsx";
import About from "./sections/About.jsx";
import Projects from "./sections/Projects.jsx";
import Skills from "./sections/Skills.jsx";
import Certificates from "./sections/Certificates.jsx";
import Contact from "./sections/Contact.jsx";

export default function App() {
  const { pathname } = useLocation();
  
  // Hide navbar for all new pages since they have their own navigation
  const hideNavbarRoutes = [
    "/", 
    "/admin-login", 
    "/admin-dashboard", 
    "/visitor-dashboard"
  ];
  
  const showNavbar = !hideNavbarRoutes.includes(pathname);

  return (
    <main>
      <Routes>
        {/* Entry Point - Role Selection */}
        <Route path="/" element={<RoleSelection />} />
        
        {/* Visitor Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Visitor Flow */}
        <Route path="/visitor-dashboard" element={<VisitorDashboard />} />
        
        {/* Admin Flow */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        
        {/* Individual sections for standalone viewing (optional) */}
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/skills" element={<Skills />} />
        <Route path="/certificates" element={<Certificates />} />
        <Route path="/contact" element={<Contact />} />
        
        {/* Fallback - redirect to role selection */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
  );
}
