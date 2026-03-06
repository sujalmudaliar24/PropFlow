import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuthContext';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="nav-brand">
                <Link to="/dashboard">
                    <span className="nav-logo">🏠</span>
                    <span className="nav-title">PropFlow</span>
                </Link>
            </div>
            <div className="nav-links">
                <Link to="/dashboard" className="nav-link">Dashboard</Link>
                <Link to="/inventory" className="nav-link">Inventory</Link>
                <Link to="/add-property" className="nav-link nav-link-cta">+ Add Property</Link>
            </div>
            <div className="nav-user">
                <span className="nav-plan-badge">{user?.plan}</span>
                <span className="nav-user-name">{user?.name}</span>
                <button onClick={handleLogout} className="nav-logout">Logout</button>
            </div>
        </nav>
    );
};

export default Navbar;
