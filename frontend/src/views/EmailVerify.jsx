// src/pages/EmailVerify.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { submitVerificationOtp, requestVerificationOtp } from '../api/authApi';  
// import { setVerified } from '../features/authSlice';  
import {motion } from 'framer-motion'
import { toast } from 'react-toastify';
import { LockClosedIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

function EmailVerify() {
    const [otp, setOtp] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (otp.length !== 6 || !/^\d+$/.test(otp)) {
            toast.warn("Please enter a valid 6-digit OTP.");
            return;
        }
        setIsVerifying(true);
        try {
            // Call your API function to submit the OTP
            const response = await submitVerificationOtp(otp);
            if (response.success) {
                toast.success(response.msg || "Email verified successfully!");
                dispatch(setVerified()); // Update Redux state
                navigate('/'); // Redirect to dashboard or main app page
            } else {
                 throw new Error(response.msg || 'Verification failed. Invalid OTP?');
            }
        } catch (error) {
            toast.error(error.message || "Incorrect OTP or verification failed.");
        } finally {
            setIsVerifying(false);
        }
    };

     const handleResendOtp = async () => {
        setIsResending(true);
        try {
            // Call your API function to request a new OTP
            const response = await requestVerificationOtp();
            if (response.success) {
                toast.success(response.msg || "A new verification OTP has been sent to your email!");
            } else {
                 throw new Error(response.msg || 'Failed to send OTP');
            }
        } catch (error) {
            toast.error(error.message || "Could not send OTP. Please try again.");
        } finally {
            setIsResending(false);
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
          <CardHeader className="space-y-4">
            <Lock className="mx-auto h-12 w-12 text-gray-400" />
            <CardTitle className="text-center text-2xl font-bold text-gray-100">
              Verify Your Email
            </CardTitle>
            <CardDescription className="text-center text-sm text-gray-300">
              An OTP has been sent to your registered email address. Please enter the 6-digit code below to complete verification.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div>
                <label htmlFor="otp" className="sr-only">
                  OTP
                </label>
                <Input
                  id="otp"
                  name="otp"
                  type="text"
                  autoComplete="one-time-code"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                  className="w-full px-3 py-3 border-gray-900/50 bg-[#1a2a44] text-gray-100 placeholder-gray-400 focus:ring-gray-500 focus:border-gray-500 text-center tracking-[0.5em]"
                  placeholder="Enter OTP"
                  disabled={isVerifying}
                  maxLength={6}
                  aria-label="Enter 6-digit OTP"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                disabled={isVerifying || otp.length !== 6}
                className="w-full bg-gray-600 hover:bg-gray-700 mt-5 text-gray-100 disabled:opacity-50"
                aria-label={isVerifying ? 'Verifying OTP' : 'Verify email'}
              >
                {isVerifying ? (
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
                    Verifying...
                  </>
                ) : (
                  'Verify Email'
                )}
              </Button>
              <Button
                variant="link"
                onClick={handleResendOtp}
                disabled={isResending || isVerifying}
                className="text-gray-400 hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
                aria-label={isResending ? 'Sending OTP' : 'Resend OTP'}
              >
                <Send className={`h-4 w-4 mr-1.5 ${isResending ? 'animate-ping' : ''}`} />
                {isResending ? 'Sending OTP...' : "Didn't receive code? Resend OTP"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
    );
}

export default EmailVerify;