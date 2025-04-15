// components/Auth.js
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import googleIcon from '../assets/icons/google-icon.svg';
import guestIcon from '../assets/icons/guest-icon.svg';
import authIcon from '../assets/icons/auth-icon.svg';

// Auth component handles Sign Up, Sign In, Google OAuth, and Guest login
const Auth = ({ onGuestSignIn }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signUp, signIn, supabase } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Basic email format validation
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  // Handles submission for email/password Sign Up or Sign In
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Input Validations
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
        // Sign Up attempt
        authResponse = await signUp(email, password);
        if (authResponse.error) {
           // Handle specific Sign Up errors from Supabase
           if (authResponse.error.message.includes('User already registered')) {
             setError('Email already registered. Please Sign In.');
           } else if (authResponse.error.message.includes('Email rate limit exceeded')) {
              setError('Too many sign up attempts. Please try again later.');
           } else {
             setError(`Sign up failed: ${authResponse.error.message}`);
           }
        } else {
           // Successful Sign Up (actual user state update happens via onAuthStateChange listener)
           console.log('Sign up successful', authResponse); // Optional success log
        }
      } else {
        // Sign In attempt
        authResponse = await signIn(email, password);
        if (authResponse.error) {
          // Handle specific Sign In errors from Supabase
          if (authResponse.error.message.includes('Invalid login credentials')) {
             setError('Incorrect email or password.');
          } else if (authResponse.error.message.includes('Email not confirmed')) {
             setError('Please confirm your email address first.');
          } else {
            setError(`Sign in failed: ${authResponse.error.message}`);
          }
        } else {
          // Successful Sign In (actual user state update happens via onAuthStateChange listener)
          console.log('Sign in successful', authResponse); // Optional success log
        }
      }
    } catch (err) {
      console.error('Auth error during email/password submission:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
       setLoading(false); // Ensure loading is stopped
    }
  };

  // Handles the initiation of the Google OAuth Sign-in flow
  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      // Define redirect URLs based on the environment (development vs. production)
      const redirectUrl =
        process.env.NODE_ENV === 'development'
          ? 'http://localhost:3000/' // Adjust port if necessary for local dev
          : 'https://shoukelp.github.io/todo-app/'; // Production URL on GitHub Pages

      // console.log('Attempting Google Sign in with redirect to:', redirectUrl); // Optional debug log

      // Call Supabase OAuth function
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          // scopes: '...', // Add additional Google scopes if needed
        },
      });

      // Catch errors that might occur before the user is redirected to Google
      if (oauthError) {
        throw oauthError;
      }
      // If successful, the browser navigates away, so loading state remains true until page reloads

    } catch (err) {
      console.error('Google sign-in initiation error:', err);
      setError(`Failed to initiate Google Sign in: ${err.message || 'Unknown error'}`);
      setLoading(false); // Stop loading only if an error happens *before* redirect
    }
  };

  // Handles the "Continue as Guest" button click
  const handleGuestLogin = () => {
    localStorage.setItem('isGuest', 'true'); // Set flag in local storage
    if (onGuestSignIn) {
      onGuestSignIn(); // Notify parent component (App.js) to update state
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
          disabled={loading} // Disable inputs during auth operations
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={isSignUp ? "new-password" : "current-password"}
          disabled={loading}
        />

        {/* Authentication Buttons */}
        <button type="submit" disabled={loading}>
          <img src={authIcon} alt="" /> {/* Alt can be empty for decorative icons */}
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

      {/* Toggle between Sign In and Sign Up views */}
      <p>
        {isSignUp ? (
          <>
            Already have an account?{' '}
            <span className="auth-toggle-link" onClick={() => !loading && setIsSignUp(false)}>
              Sign In
            </span>
          </>
        ) : (
          <>
            Don't have an account?{' '}
            <span className="auth-toggle-link" onClick={() => !loading && setIsSignUp(true)}>
              Sign Up
            </span>
          </>
        )}
      </p>
    </div>
  );
};

export default Auth;