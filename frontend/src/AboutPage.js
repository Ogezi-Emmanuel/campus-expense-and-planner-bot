import React from 'react';

function AboutPage() {
  return (
    <div className="about-page">
      <header className="about-header">
        <h1>About Campus Planner</h1>
      </header>

      <section className="about-content">
        <p>Campus Planner is designed to help students manage their academic and financial lives more effectively. Our goal is to provide a comprehensive tool that simplifies planning, tracking, and organization for a successful campus experience.</p>
        
        <h2>Our Mission</h2>
        <p>To empower students with intuitive and powerful tools that reduce stress and improve productivity, allowing them to focus on their studies and personal growth.</p>

        <h2>Key Features</h2>
        <ul>
          <li><strong>Study Planner:</strong> Organize your courses, assignments, and study schedules.</li>
          <li><strong>Expense Tracker:</strong> Monitor your spending, set budgets, and manage your finances.</li>
          <li><strong>User Dashboard:</strong> Get a quick overview of your academic progress and financial health.</li>
        </ul>

        <h2>Our Team</h2>
        <div className="team-members">
          <div className="team-member">
            <h3>Jane Doe</h3>
            <p>Co-founder & CEO</p>
            <p>Jane is passionate about education and technology, driving the vision for Campus Planner.</p>
          </div>
          <div className="team-member">
            <h3>John Smith</h3>
            <p>Co-founder & CTO</p>
            <p>John leads the technical development, ensuring a robust and user-friendly platform.</p>
          </div>
        </div>

        <h2>Contact Us</h2>
        <p>If you have any questions, feedback, or suggestions, please feel free to reach out to us at support@campusplanner.com.</p>
      </section>

      <footer className="about-footer">
        <p>&copy; 2025 Campus Planner. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default AboutPage;