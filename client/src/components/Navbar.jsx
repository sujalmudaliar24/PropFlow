import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuthContext';
import { Menu, X } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
        <nav className={`navbar ${isMenuOpen ? 'menu-open' : ''}`}>
            <div className="nav-brand">
                <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                    <span className="nav-logo">🏠</span>
                    <span className="nav-title">PropFlow</span>
                </Link>
            </div>

            <button className="mobile-menu-btn" onClick={toggleMenu}>
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <div className={`nav-content ${isMenuOpen ? 'active' : ''}`}>
                <div className="nav-links">
                    <Link to="/dashboard" className="nav-link" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
                    <Link to="/inventory" className="nav-link" onClick={() => setIsMenuOpen(false)}>Inventory</Link>
                    <Link to="/add-property" className="nav-link nav-link-cta" onClick={() => setIsMenuOpen(false)}>+ Add Property</Link>
                </div>
                <div className="nav-user">
                    <span className="nav-plan-badge">{user?.plan}</span>
                    <span className="nav-user-name">{user?.name}</span>
                    <button onClick={handleLogout} className="nav-logout">Sign out</button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
