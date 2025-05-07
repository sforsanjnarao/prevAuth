// src/pages/LoginPage.jsx (Renamed for clarity)
import React, { useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom"; // Import Link and useNavigate
import { loginUser } from "../api/authApi";         // Adjust path if needed
import { setAuth, setLoading } from "../features/authSlice"; // Adjust path if needed
import { toast } from "react-toastify";
import { ArrowRightOnRectangleIcon, LockClosedIcon, EnvelopeIcon } from '@heroicons/react/24/outline'; // Icons

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Hook for navigation
  const { loading, isAuthenticated } = useSelector((state) => state.auth); // Get loading and auth status

  // Redirect if already logged in
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/vault'); // Or your main dashboard route
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    dispatch(setLoading(true));
    try {
      // API call expects email and password
      const res = await loginUser(email, password);
      if (res.success) {
        // Backend sends back userId upon successful login
        // The access_token and jwt cookies are set httpOnly by the backend
        dispatch(setAuth({ userId: res.userId, accessToken: res.accessToken })); // Pass token if needed by setAuth logic
        toast.success(res.msg || "Login successful!");
        navigate('/vault'); // Navigate to a protected route on success
      } else {
        // Handle backend indicating failure even without throwing error
        throw new Error(res.msg || "Login failed");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.msg || err.message || "Login failed. Please check credentials.";
      console.error("Login failed:", errorMsg);
      toast.error(errorMsg);
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 space-y-6">
        <div className="text-center">
            <ArrowRightOnRectangleIcon className='mx-auto h-12 w-12 text-indigo-600'/>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900">
                Sign in to your account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
                Or{' '}
                <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                    create a new account
                </Link>
            </p>
        </div>

        <form className="space-y-5" onSubmit={handleLogin}>
          {/* Email Input */}
          <div>
            <label htmlFor="email-login" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                    id="email-login"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="block w-full appearance-none rounded-md border border-gray-300 pl-10 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    placeholder="you@example.com"
                />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password-login" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                    id="password-login"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="block w-full appearance-none rounded-md border border-gray-300 pl-10 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    placeholder="••••••••"
                />
            </div>
          </div>

          <div className="flex items-center justify-end">
            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
                Forgot your password?
              </Link>
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-75 disabled:cursor-not-allowed"
            >
                {loading ? (
                     <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : (
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <LockClosedIcon className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" aria-hidden="true" />
                    </span>
                )}
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;