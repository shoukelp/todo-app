// components/Auth.js
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import googleIcon from '../assets/icons/google-icon.svg';
import guestIcon from '../assets/icons/guest-icon.svg';
import authIcon from '../assets/icons/auth-icon.svg';

const Auth = ({ onGuestSignIn }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signUp, signIn, supabase } = useAuth();
  const [error, setError] = useState('');

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Email or password must not be empty');
      return;
    }

    if (!validateEmail(email)) {
      setError('Email format is invalid.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    try {
      if (isSignUp) {
        const { error: signUpError } = await signUp(email, password);
        if (signUpError) {
          if (signUpError.message.includes('User already registered')) {
            setError('Email already registered.');
          } else {
            setError('Sign up failed: ' + signUpError.message);
          }
        }
      } else {
        const { error: signInError } = await signIn(email, password);
        if (signInError) {
          setError('Incorrect email or password.');
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError('An error occurred while signing in/up.');
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    try {
      const redirectUrl =
        process.env.NODE_ENV === 'development'
          ? 'http://localhost:3000/todo-app'
          : 'https://shoukelp.github.io/todo-app';
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        redirectTo: redirectUrl,
      });
      if (error) throw error;
    } catch (err) {
      console.error('Google sign-in error:', err);
      setError('Failed to sign in with Google.');
    }
  };
  const handleGuestLogin = () => {
    localStorage.setItem('isGuest', 'true');
    if (onGuestSignIn) {
      onGuestSignIn();
    }
  };

  return (
    <div className="auth-container">
      <h2>{isSignUp ? 'Sign Up' : 'Sign In'}</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        <button type="submit">
          <img src={authIcon} alt="Auth Icon" style={{ marginRight: '10px' }} />
          {isSignUp ? 'Sign Up' : 'Sign In'}
        </button>
        <button type="button" onClick={handleGoogleSignIn} className="google-button">
          <img src={googleIcon} alt="Google Icon" style={{ marginRight: '10px' }} />
          Login with Google
        </button>
        <button type="button" onClick={handleGuestLogin} className="guest-button">
          <img src={guestIcon} alt="Guest Icon" style={{ marginRight: '10px' }} />
          Continue as Guest
        </button>
      </form>
      <p style={{ marginTop: '10px' }}>
      {isSignUp ? (
        <>
            Already have an account?{' '}
            <span className="auth-toggle-link" onClick={() => setIsSignUp(false)}>Sign In</span>
        </>
        ) : (
        <>
            Don't have an account?{' '}
            <span className="auth-toggle-link" onClick={() => setIsSignUp(true)}>Sign Up</span>
        </>
      )}
      </p>
    </div>
  );
};

export default Auth;