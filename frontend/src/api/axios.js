import axios from 'axios';

const BASE_URL = "http://localhost:3000/api"; // or your actual backend base URL

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // this allows sending cookies (like refresh tokens)
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;