import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './navbar.css';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Helper function to apply the active class dynamically
  const navClass = ({ isActive }) => (isActive ? 'nav-item active' : 'nav-item');

  const resumeUrl = "https://poor-beige-gayal.myfilebase.com/ipfs/Qmd3jWk3kUgLxP5dZCBUycyCX14GRf9phKeMZxpCj9nDF8";

  const handleResumeClick = () => {
    window.open(resumeUrl, '_blank', 'noopener,noreferrer');
    setIsMobileMenuOpen(false); 
  };

  return (
    <nav className="portfolio-nav">
      {/* Brand/Logo Section */}
      <div className="nav-brand">
        {/* Use a standard link for the logo to go home */}
        <NavLink to="/" className="logo-text" onClick={closeMobileMenu}>Ankit <span>Shiv</span></NavLink>
      </div>
      
      {/* Navigation Links */}
      <div className={`nav-links ${isMobileMenuOpen ? 'active' : ''}`}>
        <NavLink to="/about" className={navClass} onClick={closeMobileMenu}>About</NavLink>
        <NavLink to="/projects" className={navClass} onClick={closeMobileMenu}>Projects</NavLink>
        <NavLink to="/experience" className={navClass} onClick={closeMobileMenu}>Experience</NavLink>
        <NavLink to="/contact" className={navClass} onClick={closeMobileMenu}>Contact</NavLink>
        <div className="mobile-cta-wrapper">
          <button className="cta-button" onClick={handleResumeClick}>Resume</button>
        </div>
      </div>

      {/* Action Button & Mobile Toggle */}
      <div className="nav-actions">
        <button className="cta-button desktop-cta" onClick={handleResumeClick}>Resume</button>
        
        <button 
          className={`mobile-menu-btn ${isMobileMenuOpen ? 'open' : ''}`} 
          onClick={toggleMenu}
          aria-label="Toggle navigation"
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
