import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar: React.FC = () => {
  const { username, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname.startsWith(path) ? 'active' : '';
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/dashboard">
          <h2>🏥 HMS</h2>
        </Link>
      </div>
      
      <div className="navbar-menu">
        <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`}>
          Dashboard
        </Link>
        <Link to="/patients" className={`nav-link ${isActive('/patients')}`}>
          Patients
        </Link>
        <Link to="/doctors" className={`nav-link ${isActive('/doctors')}`}>
          Doctors
        </Link>
        <Link to="/appointments" className={`nav-link ${isActive('/appointments')}`}>
          Appointments
        </Link>
        <Link to="/billing" className={`nav-link ${isActive('/billing')}`}>
          Billing
        </Link>
      </div>
      
      <div className="navbar-user">
        <span className="username">👤 {username}</span>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
