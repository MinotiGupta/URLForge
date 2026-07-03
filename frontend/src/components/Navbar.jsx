import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Menu, X, LogOut, LayoutDashboard, Link2, Shield } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner page-container">
        <Link to="/" className="navbar-logo">
          <div className="logo-icon">
            <Zap size={18} />
          </div>
          <span>URL<strong>Forge</strong></span>
        </Link>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          {user ? (
            <>
              <Link to="/dashboard" className="nav-link" onClick={() => setMenuOpen(false)}>
                <LayoutDashboard size={15} /> Dashboard
              </Link>
              <Link to="/links" className="nav-link" onClick={() => setMenuOpen(false)}>
                <Link2 size={15} /> My Links
              </Link>
              {user.is_admin && (
                <Link to="/admin" className="nav-link nav-link-admin" onClick={() => setMenuOpen(false)}>
                  <Shield size={15} /> Admin
                </Link>
              )}
              <div className="nav-divider" />
              <span className="nav-user">{user.email}</span>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                <LogOut size={14} /> Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm" onClick={() => setMenuOpen(false)}>Sign in</Link>
              <Link to="/signup" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>Get started</Link>
            </>
          )}
        </div>

        <button className="navbar-hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
    </nav>
  );
}
