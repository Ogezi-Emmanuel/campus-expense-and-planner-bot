import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { supabase } from './supabaseClient';
import Auth from './Auth';
import Account from './Account';
import SignUp from './SignUp';
import LandingPage from './LandingPage';
import AboutPage from './AboutPage';
import Dashboard from './Dashboard';
import StudyPlanner from './StudyPlanner';
import ExpenseTracker from './ExpenseTracker';
import Navbar from './Navbar';
import './App.css';

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  return (
    <Router>
      <Navbar session={session} />
      <div className="container">
        {!session ? (
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        ) : (
          <Routes>
            <Route path="/" element={<Dashboard />} />
            {session && session.user && (
              <Route path="/account" element={<Account key={session.user.id} session={session} />} />
            )}
            <Route path="/study-planner" element={<StudyPlanner />} />
            <Route path="/expense-tracker" element={<ExpenseTracker />} />
          </Routes>
        )}
      </div>
    </Router>
  );
}

export default App;
