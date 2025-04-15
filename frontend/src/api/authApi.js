import axios from "axios";

// Axios instance with credentials enabled for cookie-based auth
const API = axios.create({
  baseURL: "http://localhost:3000/api", // change if needed
  withCredentials: true, // ⬅️ Important for sending cookies
});

// Register
export const registerUser = async (name, email, password) => {
  const res = await API.post("/auth/register", { name, email, password });
  return res.data;
};

// Login
export const loginUser = async (email, password) => {
  const res = await API.post("/auth/login", { email, password });
  return res.data;
};

// Logout
export const logoutUser = async () => {
  const res = await API.post("/auth/logout");
  return res.data;
};