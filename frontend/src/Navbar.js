import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';

function Navbar({ session }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Campus Planner</Link>
      </div>
      <div className="menu-icon" onClick={toggleMenu}>
        ☰
      </div>
      <ul className={`navbar-nav ${isOpen ? 'open' : ''}`}>
        {!session ? (
          <>
            <li className="nav-item">
              <Link to="/about" onClick={toggleMenu}>About</Link>
            </li>
            <li className="nav-item">
              <Link to="/login" onClick={toggleMenu}>Login</Link>
            </li>
            <li className="nav-item">
              <Link to="/signup" onClick={toggleMenu}>Sign Up</Link>
            </li>
          </>
        ) : (
          <>
            <li className="nav-item">
              <Link to="/" onClick={toggleMenu}>Dashboard</Link>
            </li>
            <li className="nav-item">
              <Link to="/study-planner" onClick={toggleMenu}>Study Planner</Link>
            </li>
            <li className="nav-item">
              <Link to="/expense-tracker" onClick={toggleMenu}>Expense Tracker</Link>
            </li>
            <li className="nav-item">
              <button className="button" onClick={handleSignOut}>Sign Out</button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;