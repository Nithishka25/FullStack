import React from 'react';
import { Routes, Route, Link, NavLink, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Survey from './pages/Survey.jsx';
import Confirm from './pages/Confirm.jsx';
import Admin from './pages/Admin.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { useAuth } from './auth.jsx';

export default function App() {
  const { user, logout } = useAuth();
  return (
    <div>
      <nav className="navbar">
        {!user && <NavLink to="/login" className={({ isActive }) => isActive ? 'active' : ''}>Login</NavLink>}
        {user && <NavLink to="/survey" className={({ isActive }) => isActive ? 'active' : ''}>Survey</NavLink>}
        {user?.role === 'admin' && <NavLink to="/admin" className={({ isActive }) => isActive ? 'active' : ''}>Admin</NavLink>}
        {user && (
          <div className="navbar-right">
            <span className="muted small">{user.email}</span>
            <button className="button inline secondary" onClick={logout}>Logout</button>
          </div>
        )}
      </nav>
      <div className="container">
      <Routes>
        <Route path="/" element={<Navigate to={user ? '/survey' : '/login'} replace />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/survey"
          element={
            <ProtectedRoute>
              <Survey />
            </ProtectedRoute>
          }
        />
        <Route
          path="/confirm"
          element={
            <ProtectedRoute>
              <Confirm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<div>Not Found</div>} />
      </Routes>
      </div>
    </div>
  );
}
