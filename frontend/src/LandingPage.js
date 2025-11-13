import React from 'react';
import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <div className="landing-page-container">
      <header className="hero">
        <h1>Welcome to Campus Planner!</h1>
        <p>Your all-in-one solution for managing campus life.</p>
        <div className="hero-buttons">
          <Link to="/signup" className="button primary">Get Started</Link>
          <Link to="/login" className="button secondary">Login</Link>
        </div>
      </header>

      <section className="features">
        <h2>Features</h2>
        <div className="feature-list">
          <div className="feature-item">
            <h3>Study Planner</h3>
            <p>Organize your academic schedule, assignments, and study sessions.</p>
          </div>
          <div className="feature-item">
            <h3>Expense Tracker</h3>
            <p>Keep track of your campus expenses and manage your budget.</p>
          </div>
          <div className="feature-item">
            <h3>User Dashboard</h3>
            <p>A personalized dashboard to view your progress and important information.</p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <p>&copy; 2025 Campus Planner. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default LandingPage;