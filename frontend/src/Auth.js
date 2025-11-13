import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error(error);
      alert('Login failed. Please check your credentials.');
    } else {
      navigate('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="row flex flex-center">
      <div className="col-6 form-widget">
        <h1 className="header">Campus Expense and Planner Bot</h1>
        <p className="description">Welcome back! Please log in to manage your campus expenses and plans.</p>
        <form className="flex flex-col gap-4" onSubmit={handleLogin}>
          <input
            className="inputField"
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="inputField"
            type="password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="button block" disabled={loading}>
            {loading ? 'Loading' : 'Login'}
          </button>
        </form>
        <p className="description">
          Don't have an account? <a href="/signup">Sign Up</a>
        </p>
      </div>
    </div>
  );
}

export default Auth;