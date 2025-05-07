// src/pages/SignupPage.jsx (Or RegisterPage.jsx)
import React, { useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api/authApi"; // Adjust path
import { setAuth, setLoading } from "../features/authSlice"; // Adjust path
import { toast } from "react-toastify";
import { UserPlusIcon, LockClosedIcon, EnvelopeIcon, UserIcon } from '@heroicons/react/24/outline';

function SignupPage() {
    const [name, setName] = useState(""); // Or firstName/lastName
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, isAuthenticated } = useSelector((state) => state.auth);
    const [error, setError] = useState(null); // For form validation errors

    // Redirect if already logged in
    React.useEffect(() => {
        if (isAuthenticated) {
            navigate('/vault'); // Or your main dashboard route
        }
    }, [isAuthenticated, navigate]);

    const handleRegister = async (e) => {
        e.preventDefault();
        setError(null); // Clear previous errors

        // --- Client-side Validation ---
        if (!name || !email || !password || !confirmPassword) {
            setError("Please fill in all fields.");
            toast.warn("Please fill in all fields.");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            toast.warn("Passwords do not match.");
            return;
        }
         if (password.length < 8) { // Match backend requirement
            setError("Password must be at least 8 characters long.");
            toast.warn("Password must be at least 8 characters long.");
            return;
        }
        // Basic email format check (optional, backend validates too)
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError("Please enter a valid email address.");
             toast.warn("Please enter a valid email address.");
            return;
        }
        // --- End Validation ---


        dispatch(setLoading(true));
        try {
            // API call expects name, email, password
            const res = await registerUser(name, email, password);
            if (res.success) {
                // Backend handles setting cookies. Dispatch setAuth to update Redux state.
                // Assuming register API returns userId similar to login
                 dispatch(setAuth({ userId: res.userId, accessToken: res.accessToken })); // Pass token if needed by setAuth
                 toast.success(res.msg || "Registration successful!");
                // Decide where to navigate:
                // Option 1: Directly to vault (user might not be verified yet)
                navigate('/vault');
                // Option 2: To verification page
                // navigate('/verify-email');
            } else {
                throw new Error(res.msg || "Registration failed");
            }
        } catch (err) {
            const errorMsg = err.response?.data?.msg || err.message || "Registration failed. Please try again.";
            console.error("Registration failed:", errorMsg);
            toast.error(errorMsg);
            // Don't set the form error state here, rely on toast
        } finally {
            dispatch(setLoading(false));
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 via-white to-indigo-100 px-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 space-y-6">
                 <div className="text-center">
                    <UserPlusIcon className='mx-auto h-12 w-12 text-indigo-600'/>
                    <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900">
                        Create your account
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Or{' '}
                        <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                            sign in to your existing account
                        </Link>
                    </p>
                </div>

                 <form className="space-y-5" onSubmit={handleRegister}>
                     {/* Name Input */}
                     <div>
                        <label htmlFor="name-signup" className="block text-sm font-medium text-gray-700">Full Name</label>
                         <div className="mt-1 relative rounded-md shadow-sm">
                             <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><UserIcon className="h-5 w-5 text-gray-400"/></div>
                             <input id="name-signup" name="name" type="text" required value={name} onChange={e => setName(e.target.value)}
                                     className="block w-full appearance-none rounded-md border border-gray-300 pl-10 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm" placeholder="Your Name"/>
                         </div>
                     </div>

                    {/* Email Input */}
                     <div>
                        <label htmlFor="email-signup" className="block text-sm font-medium text-gray-700">Email address</label>
                         <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><EnvelopeIcon className="h-5 w-5 text-gray-400"/></div>
                            <input id="email-signup" name="email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)}
                                    className="block w-full appearance-none rounded-md border border-gray-300 pl-10 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm" placeholder="you@example.com"/>
                         </div>
                    </div>

                    {/* Password Input */}
                    <div>
                         <label htmlFor="password-signup" className="block text-sm font-medium text-gray-700">Password</label>
                         <div className="mt-1 relative rounded-md shadow-sm">
                             <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><LockClosedIcon className="h-5 w-5 text-gray-400"/></div>
                             <input id="password-signup" name="password" type="password" autoComplete="new-password" required value={password} onChange={e => setPassword(e.target.value)} minLength="8"
                                     className="block w-full appearance-none rounded-md border border-gray-300 pl-10 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm" placeholder="Min. 8 characters"/>
                         </div>
                    </div>

                    {/* Confirm Password Input */}
                     <div>
                         <label htmlFor="confirmPassword-signup" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                         <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><LockClosedIcon className="h-5 w-5 text-gray-400"/></div>
                            <input id="confirmPassword-signup" name="confirmPassword" type="password" autoComplete="new-password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} minLength="8"
                                     className="block w-full appearance-none rounded-md border border-gray-300 pl-10 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm" placeholder="Re-enter password"/>
                         </div>
                    </div>

                    {/* Display Form Errors */}
                     {error && <p className="text-sm text-red-600">{error}</p>}


                    {/* Submit Button */}
                    <div>
                        <button type="submit" disabled={loading}
                                className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-75 disabled:cursor-not-allowed">
                            {loading ? (
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            ) : (
                                 <span className="absolute inset-y-0 left-0 flex items-center pl-3"><UserPlusIcon className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400"/></span>
                            )}
                             {loading ? "Creating Account..." : "Create Account"}
                        </button>
                    </div>
                 </form>
            </div>
        </div>
    );
}

export default SignupPage;