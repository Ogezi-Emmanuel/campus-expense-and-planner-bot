import React, { useState } from 'react';
import { supabase } from './supabaseClient';

function SignUp() {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });

    if (error) {
      console.error(error);
      alert('Sign up failed. Please try again.');
    } else {
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            { id: data.user.id, full_name: name }
          ]);

        if (profileError) {
          console.error('Error creating profile:', profileError);
          alert('Sign up successful, but failed to create profile. Please contact support.');
        } else {
          alert('Check your email for the confirmation link!');
        }
      } else {
        alert('Check your email for the confirmation link!');
      }
    }
    setLoading(false);
  };

  return (
    <div className="row flex flex-center">
      <div className="col-6 form-widget">
        <h1 className="header">Sign Up</h1>
        <p className="description">Create your account</p>
        <form className="flex flex-col gap-4" onSubmit={handleSignUp}>
          <input
            className="inputField"
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
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
          <input
            className="inputField"
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button className="button block" disabled={loading}>
            {loading ? 'Loading' : 'Sign Up'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default SignUp;