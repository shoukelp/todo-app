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
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Email and password must not be empty.');
      setLoading(false);
      return;
    }
    if (!validateEmail(email)) {
      setError('Email format is invalid.');
      setLoading(false);
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      setLoading(false);
      return;
    }

    try {
      let authResponse;
      if (isSignUp) {
        authResponse = await signUp(email, password);
        if (authResponse.error) {
          if (authResponse.error.message.includes('User already registered')) {
            setError('Email already registered. Please Sign In.');
          } else if (authResponse.error.message.includes('Email rate limit exceeded')) {
            setError('Too many sign up attempts. Please try again later.');
          } else {
            setError(`Sign up failed: ${authResponse.error.message}`);
          }
        }
        // Success handled by onAuthStateChange listener in useAuth
      } else {
        authResponse = await signIn(email, password);
        if (authResponse.error) {
          if (authResponse.error.message.includes('Invalid login credentials')) {
            setError('Incorrect email or password.');
          } else if (authResponse.error.message.includes('Email not confirmed')) {
            setError('Please confirm your email address first.');
          } else {
            setError(`Sign in failed: ${authResponse.error.message}`);
          }
        }
        // Success handled by onAuthStateChange listener in useAuth
      }
    } catch (err) {
      console.error('Auth error during email/password submission:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const redirectUrl =
        process.env.NODE_ENV === 'development'
          ? 'http://localhost:3000/' // Adjust port if necessary
          : 'https://shoukelp.github.io/todo-app/'; // Production URL

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (oauthError) {
        throw oauthError;
      }

    } catch (err) {
      console.error('Google sign-in initiation error:', err);
      setError(`Failed to initiate Google Sign in: ${err.message || 'Unknown error'}`);
      setLoading(false);
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
          disabled={loading}
          aria-label="Email"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={isSignUp ? "new-password" : "current-password"}
          disabled={loading}
          aria-label="Password"
        />

        <button type="submit" disabled={loading}>
          <img src={authIcon} alt="" />
          <span>{loading ? (isSignUp ? 'Signing Up...' : 'Signing In...') : (isSignUp ? 'Sign Up' : 'Sign In')}</span>
        </button>

        <button type="button" onClick={handleGoogleSignIn} className="google-button" disabled={loading}>
          <img src={googleIcon} alt="" />
          <span>{loading ? 'Redirecting...' : 'Login with Google'}</span>
        </button>

        <button type="button" onClick={handleGuestLogin} className="guest-button" disabled={loading}>
          <img src={guestIcon} alt="" />
          <span>Continue as Guest</span>
        </button>
      </form>

      <p>
        {isSignUp ? (
          <>
            Already have an account?{' '}
            {/* Ganti button menjadi a */}
            <a
              href="#"
              className="auth-toggle-link"
              onClick={(e) => {
                e.preventDefault();
                if (!loading) {
                  setIsSignUp(false);
                }
              }}
              style={loading ? { pointerEvents: 'none', opacity: 0.6 } : {}}
            >
              Sign In
            </a>
          </>
        ) : (
          <>
            Don't have an account?{' '}
            { }
            <a
              href="#"
              className="auth-toggle-link"
              onClick={(e) => {
                e.preventDefault();
                if (!loading) {
                  setIsSignUp(true);
                }
              }}
              style={loading ? { pointerEvents: 'none', opacity: 0.6 } : {}}
            >
              Sign Up
            </a>
          </>
        )}
      </p>
    </div>
  );
};

export default Auth;