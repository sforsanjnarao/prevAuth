
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { loginUser } from '../api/authApi';
import { setAuth, setLoading } from '../features/authSlice';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, isAuthenticated } = useSelector((state) => state.auth);

  // Redirect if already logged in
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/vault');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    dispatch(setLoading(true));
    try {
      const res = await loginUser(email, password);
      if (res.success) {
        dispatch(setAuth({ userId: res.userId, accessToken: res.accessToken }));
        toast.success(res.msg || 'Login successful!');
        navigate('/vault');
      } else {
        throw new Error(res.msg || 'Login failed');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.msg || err.message || 'Login failed. Please check credentials.';
      console.error('Login failed:', errorMsg);
      toast.error(errorMsg);
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0a192f] px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <Card className="bg-[#112240] border-gray-900/50 shadow-lg">
          <CardHeader className="space-y-4 text-center">
             <Link
              to="/"
              className="flex  justify-center items-center gap-2 text-white text-3xl font-bold"
            >
              <ShieldCheck className="h-6 w-6 text-blue-400" />
              Secure<span className="text-blue-400">Suite</span>
            </Link>
            <CardTitle className="text-base text-gray-100">
              Sign in to your account
            
            <CardDescription className="text-gray-300">
              Or{' '}
              <Link
                to="/register"
                className="font-medium text-blue-400 hover:text-gray-300"
              >
                create a new account
              </Link>
            </CardDescription>
            </CardTitle>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-5">
              {/* Email Input */}
              <div>
                <label
                  htmlFor="email-login"
                  className="block text-sm font-medium text-gray-300"
                >
                  Email address
                </label>
                <div className="mt-1 relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <Input
                    id="email-login"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border-gray-900/50 bg-[#1a2a44] text-gray-100 placeholder-gray-400  focus:ring-gray-500 focus:border-gray-500"
                    placeholder="you@example.com"
                    aria-label="Email address"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label
                  htmlFor="password-login"
                  className="block text-sm font-medium text-gray-300"
                >
                  Password
                </label>
                <div className="mt-1 relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <Input
                    id="password-login"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10  pr-3 py-2 border-gray-900/50 bg-[#1a2a44] text-gray-100 placeholder-gray-400 focus:ring-gray-500 focus:border-gray-500"
                    placeholder="••••••••"
                    aria-label="Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-300 focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <Eye className="h-5 w-5" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end my-2">
                <Link
                  to="/"
                  className="text-sm font-medium text-gray-400 hover:text-gray-300"
                >
                  Forgot your password?
                </Link>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={loading ? 'Signing in' : 'Sign in'}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-100"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="h-5 w-5 mr-2 text-gray-400" aria-hidden="true" />
                    Sign in
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}

export default LoginPage;
