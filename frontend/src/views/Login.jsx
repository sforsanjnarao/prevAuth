import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Assuming use of React Router
// Using outline icons, but solid might fit the dark theme better sometimes
import { CameraIcon, CheckIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';

// Placeholder for your actual API functions
// import { loginUser, signupUser } from '../api/auth.api';
// Placeholder for your auth context
// import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [isLoginView, setIsLoginView] = useState(true); // Start with login view
    const [formData, setFormData] = useState({
        email: '', // Can be used for username too if backend accepts it
        password: '',
        confirmPassword: '', // Only used in signup view
        rememberMe: false,   // Only used in login view
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    // const navigate = useNavigate(); // Uncomment if using react-router redirection
    // const { login } = useAuth(); // Uncomment if using AuthContext

    const handleInputChange = (event) => {
        const { name, value, type, checked } = event.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const toggleView = () => {
        setIsLoginView(!isLoginView);
        setError(''); // Clear errors when switching views
        setFormData({ // Reset form data
            email: '',
            password: '',
            confirmPassword: '',
            rememberMe: false,
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setIsLoading(true);

        // Basic validation for signup
        if (!isLoginView && formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            setIsLoading(false);
            return;
        }

        try {
            let response;
            if (isLoginView) {
                console.log("Submitting Login:", { email: formData.email, password: formData.password, rememberMe: formData.rememberMe });
                // --- Replace with actual API call ---
                // response = await loginUser({ username: formData.email, password: formData.password });
                // login(response.accessToken, response.user); // Update Auth Context
            } else {
                 console.log("Submitting Signup:", { email: formData.email, password: formData.password });
                 // --- Replace with actual API call ---
                // response = await signupUser({ email: formData.email, password: formData.password });
                // Potentially auto-login or show success message and switch view
                // login(response.accessToken, response.user); // Example auto-login
                alert('Signup successful! Please log in.'); // Simple feedback for now
                toggleView(); // Switch to login view after successful signup
            }

             // --- Simulate API call for demo ---
             await new Promise(resolve => setTimeout(resolve, 1000));
             console.log('Simulated Auth Success');
             // --- Redirect on Success ---
             // navigate('/dashboard'); // Redirect to dashboard or desired page

        } catch (err) {
            console.error("Auth Error:", err);
            // Try to get a meaningful error message from API response or use a generic one
            setError(err?.response?.data?.message || err.message || `Failed to ${isLoginView ? 'login' : 'sign up'}. Please try again.`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        // --- Outer container: Dark background like AuthKit ---
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-neutral-950 to-gray-800 flex items-center justify-center p-4">

            {/* --- Glassmorphism Card with AuthKit colors --- */}
            {/* Adjusted background/border opacity and colors */}
            <div className="w-full max-w-md bg-slate-800/70 backdrop-blur-lg rounded-2xl shadow-xl border border-slate-700/50 overflow-hidden">
                <div className="p-8 sm:p-10 text-slate-100"> {/* Default text color */}

                    {/* Icon/Logo Area */}
                    <div className="flex justify-center mb-6">
                        {/* Adjusted icon container background/border */}
                        <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center border border-slate-600/60">
                            {/* Adjusted icon color */}
                            <CameraIcon className="w-8 h-8 text-slate-300" />
                        </div>
                    </div>

                    {/* Heading */}
                    <h2 className="text-2xl font-semibold text-center text-slate-100 mb-6">
                        {isLoginView ? 'Sign in to PrevGuard' : 'Create Account'}
                    </h2>

                    {/* Error Message Display - Dark theme */}
                    {error && (
                         <div className="bg-red-900/50 border border-red-700/50 text-red-200 px-4 py-2 rounded-md text-sm mb-6 text-center" role="alert">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email/Username Input */}
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                {/* Adjusted icon color */}
                                <EnvelopeIcon className="w-5 h-5 text-slate-400" />
                            </span>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={formData.email}
                                onChange={handleInputChange}
                                disabled={isLoading}
                                // Adjusted input styling (bg, border, text, placeholder, focus)
                                className="w-full pl-10 pr-3 py-2.5 bg-slate-700/60 border border-slate-600/80 rounded-lg text-slate-100 placeholder-slate-400/90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                placeholder="Email Address"
                            />
                        </div>

                        {/* Password Input */}
                        <div className="relative">
                             <span className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                {/* Adjusted icon color */}
                                <LockClosedIcon className="w-5 h-5 text-slate-400" />
                            </span>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete={isLoginView ? "current-password" : "new-password"}
                                required
                                value={formData.password}
                                onChange={handleInputChange}
                                disabled={isLoading}
                                // Adjusted input styling (bg, border, text, placeholder, focus)
                                className="w-full pl-10 pr-3 py-2.5 bg-slate-700/60 border border-slate-600/80 rounded-lg text-slate-100 placeholder-slate-400/90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                placeholder="Password"
                            />
                        </div>

                        {/* Confirm Password Input (Signup only) */}
                        {!isLoginView && (
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                    <LockClosedIcon className="w-5 h-5 text-slate-400" />
                                </span>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    disabled={isLoading}
                                    // Adjusted input styling (bg, border, text, placeholder, focus)
                                    className="w-full pl-10 pr-3 py-2.5 bg-slate-700/60 border border-slate-600/80 rounded-lg text-slate-100 placeholder-slate-400/90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                    placeholder="Confirm Password"
                                />
                            </div>
                        )}

                        {/* Remember Me & Forgot Password (Login only) */}
                        {isLoginView && (
                            <div className="flex items-center justify-between text-sm">
                                <label htmlFor="rememberMe" className="flex items-center cursor-pointer group">
                                    <input
                                        id="rememberMe"
                                        name="rememberMe"
                                        type="checkbox"
                                        checked={formData.rememberMe}
                                        onChange={handleInputChange}
                                        disabled={isLoading}
                                        className="sr-only peer" // Keep hidden
                                    />
                                    {/* Custom Checkbox - Adjusted for dark theme */}
                                    <div className="w-4 h-4 bg-slate-700/70 border border-slate-600 rounded-[4px] mr-2 flex-shrink-0 flex items-center justify-center transition duration-200 group-hover:border-slate-500 peer-checked:bg-blue-600 peer-checked:border-transparent peer-focus:ring-2 peer-focus:ring-blue-500 peer-focus:ring-offset-2 peer-focus:ring-offset-slate-900"> {/* Adjusted offset */}
                                        <CheckIcon className={`w-3 h-3 text-white transition duration-200 ${formData.rememberMe ? 'opacity-100' : 'opacity-0'}`} />
                                    </div>
                                    {/* Adjusted text color */}
                                    <span className="text-slate-300 group-hover:text-slate-100 select-none">Remember me</span>
                                </label>
                                <Link
                                    to="/forgot-password"
                                    // Adjusted link colors
                                    className="font-medium text-blue-400 hover:text-blue-300 transition duration-200"
                                >
                                    Forgot Password?
                                </Link>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                // Adjusted button styling (bg, hover, focus offset, loading state)
                                className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 transition duration-200 ${
                                    isLoading
                                        ? 'bg-blue-800/60 cursor-not-allowed' // Darker loading bg
                                        : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                                }`}
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </>
                                ) : (
                                    isLoginView ? 'Sign In' : 'Create Account'
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Toggle Link */}
                    <p className="mt-8 text-center text-sm text-slate-400"> {/* Adjusted text color */}
                        {isLoginView ? "Don't have an account?" : "Already have an account?"}{' '}
                        <button
                            type="button"
                            onClick={toggleView}
                            disabled={isLoading}
                            // Adjusted link colors
                            className="font-semibold text-blue-400 hover:text-blue-300 focus:outline-none focus:underline transition duration-200"
                        >
                            {isLoginView ? 'Sign up' : 'Sign in'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;