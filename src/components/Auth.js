// components/Auth.js
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import googleIcon from '../assets/icons/google-icon.svg';
import guestIcon from '../assets/icons/guest-icon.svg';
import authIcon from '../assets/icons/auth-icon.svg'; // Ikon untuk Sign In/Up

const Auth = ({ onGuestSignIn }) => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { signUp, signIn, supabase } = useAuth();
    const [isGuest, setIsGuest] = useState(false);
    const [error, setError] = useState('');

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email) {
            setError('Email or password must not be empty');
            return;
        }

        if (!validateEmail(email)) {
            setError('Email format is invalid.');
            return;
        }

        if (!password) {
            setError('Password cannot be empty.');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        try {
            if (isSignUp) {
                const { error: signUpError } = await signUp(email, password);
                if (signUpError) {
                    if (signUpError.message.includes('User already registered')) {
                        setError('Email already registered.');
                    } else if (signUpError.message.includes('Invalid email format')) {
                        setError('Email format is invalid.');
                    } else if (signUpError.message.includes('Password should be at least 6 characters')) {
                        setError('Password must be at least 6 characters.');
                    } else {
                        setError('Failed to register: ' + signUpError.message);
                    }
                }
            } else {
                const { error: signInError } = await signIn(email, password);
                if (signInError) {
                    setError('Incorrect email or password.');
                }
            }
        } catch (err) {
            console.error("Error during auth:", err);
            setError('An error occurred while ' + (isSignUp ? 'sign up' : 'sign in') + '.');
        }
    };

    const handleGoogleSignIn = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
        });

        if (error) {
            console.error('Error signing in with Google:', error);
            setError('Failed to sign in with Google.');
        }
    };

    const handleGuestLogin = () => {
        console.log("Guest button clicked");
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
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit" style={{ justifyContent: 'center' }}>
                    <img src={authIcon} alt="Auth Icon" style={{ marginRight: '10px' }} />
                    <span>{isSignUp ? 'Sign Up' : 'Sign In'}</span>
                </button>
                <button type="button" onClick={handleGoogleSignIn} className="google-button" style={{ justifyContent: 'center' }}>
                    <img src={googleIcon} alt="Google Icon" style={{ marginRight: '10px' }} />
                    <span>Login with Google</span>
                </button>
                <button type="button" onClick={handleGuestLogin} className="guest-button" style={{ justifyContent: 'center' }}>
                    <img src={guestIcon} alt="Guest Icon" style={{ marginRight: '10px' }} />
                    <span>Continue as Guest</span>
                </button>
            </form>
            <a onClick={() => setIsSignUp(!isSignUp)}>
                {isSignUp ? 'Already have an account? Sign In' : 'Don\'t have an account? Sign Up'}
            </a>
        </div>
    );
};

export default Auth;