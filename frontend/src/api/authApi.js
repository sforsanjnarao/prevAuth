// src/api/authApi.js
import axiosInstance from "./axios";

// Register
export const registerUser = async (name, email, password) => {
  const res = await axiosInstance.post("/auth/register", { name, email, password },{ withCredentials: true });
  return res.data;
};

// Login
export const loginUser = async (email, password) => {
  const res = await axiosInstance.post("/auth/login", { email, password });
  return res.data;
};

// Logout
export const logoutUser = async () => {
  const res = await axiosInstance.post("/auth/logout");
  return res.data;
};

// Refresh Token
export const refreshAccessToken = async () => {
  const res = await axiosInstance.post("/auth/refresh-token",{
    withCredentials: true,
  });
  return res.data;
};

// get User Profile
export const getProfile = async () => {
    const res = await axiosInstance.get("/auth/me");
    return res.data;
  };


  // --- Email Verification Functions ---

export const requestVerificationOtp = async () => {
  try {
      const res = await axiosInstance.post("/auth/send-verify-otp");
      return res.data;  
  } catch (error) {
      console.error("API Error - requestVerificationOtp:", error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to request verification OTP');
  }
};

/**
* @param {string} otp 
*/
export const submitVerificationOtp = async (otp) => {
  try {
     
      const res = await axiosInstance.post("/auth/verify-email", { otp });
      return res.data;  
  } catch (error) {
      console.error("API Error - submitVerificationOtp:", error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to verify OTP');
  }
};


// --- Password Reset Functions ---
/**
* @param {string} email 
*/
export const requestPasswordResetOtp = async (email) => {
   try {
      const res = await axiosInstance.post("/auth/send-reset-otp", { email });
      return res.data; 
  } catch (error) {
      console.error("API Error - requestPasswordResetOtp:", error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to send reset OTP request');
  }
};

/**
* @param {string} email
* @param {string} otp
* @param {string} newPassword
*/
export const resetPasswordWithOtp = async (email, otp, newPassword) => {
   try {
      const res = await axiosInstance.post("/auth/reset-password", { email, otp, newPassword });
      return res.data; 
  } catch (error) {
      console.error("API Error - resetPasswordWithOtp:", error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to reset password');
  }
};
