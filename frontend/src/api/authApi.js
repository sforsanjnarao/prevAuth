// src/api/authApi.js
import axiosInstance from "./axios";

// Register
export const registerUser = async (name, email, password) => {
  const res = await axiosInstance.post("/auth/register", { name, email, password });
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
  const res = await axiosInstance.post("/auth/refresh");
  return res.data;
};

// get User Profile
export const getProfile = async () => {
    const res = await axiosInstance.get("/auth/me");
    return res.data;
  };