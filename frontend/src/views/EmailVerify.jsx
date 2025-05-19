// src/pages/EmailVerify.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { submitVerificationOtp, requestVerificationOtp } from '../api/authApi';  
// import { setVerified } from '../features/authSlice';  
import { toast } from 'react-toastify';
import { LockClosedIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

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
         <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4 py-12">
            <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-xl shadow-lg space-y-8">
                 <div>
                     <LockClosedIcon className="mx-auto h-12 w-auto text-indigo-600" />
                     <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                         Verify Your Email
                     </h2>
                     <p className="mt-2 text-center text-sm text-gray-600">
                         An OTP has been sent to your registered email address.
                         Please enter the 6-digit code below to complete verification.
                     </p>
                 </div>
                 <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                     <div className="rounded-md shadow-sm -space-y-px">
                         <div>
                             <label htmlFor="otp" className="sr-only">OTP</label>
                             <input
                                 id="otp"
                                 name="otp"
                                 type="text" // Use text to allow easier input of 6 digits
                                 autoComplete="one-time-code"
                                 required
                                 value={otp}
                                 onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))} // Allow only 6 digits
                                 className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm text-center tracking-[0.5em]" // Center text, add tracking
                                 placeholder="Enter OTP"
                                 disabled={isVerifying}
                                 maxLength="6"
                             />
                         </div>
                     </div>

                     <div>
                         <button
                             type="submit"
                             disabled={isVerifying || otp.length !== 6}
                             className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                         >
                             {isVerifying ? (
                                 <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Verifying...
                                 </>
                             ) : (
                                'Verify Email'
                             )}
                         </button>
                     </div>
                 </form>
                  <div className="text-sm text-center mt-6">
                    <button
                        onClick={handleResendOtp}
                        disabled={isResending || isVerifying}
                        className="font-medium text-indigo-600 hover:text-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
                    >
                        <PaperAirplaneIcon className={`h-4 w-4 mr-1.5 ${isResending ? 'animate-ping' : ''}`} />
                        {isResending ? 'Sending OTP...' : "Didn't receive code? Resend OTP"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default EmailVerify;