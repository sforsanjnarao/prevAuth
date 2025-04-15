// src/api/axios.js
import axios from "axios";
import { refreshAccessToken } from "./authApi";
import {store} from "../store";
import { setAuth, clearAuth } from "../features/authSlice";
import { toast } from "react-toastify";

const BASE_URL = "http://localhost:3000/api";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send cookies
  // headers: {
  //   "Content-Type": "application/json",
  // },
});

// ⛑️ Auto-refresh access token if expired
axiosInstance.interceptors.response.use(  //Axios interceptor that handles all failed responses globally.
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/refresh-token")
    ) {
      originalRequest._retry = true;
      try {
        const res = await refreshAccessToken();
        console.log(res)
        store.dispatch(setAuth({ userId: res.userId }));
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        store.dispatch(clearAuth());
        toast.error("Session expired. Please log in again.");
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;