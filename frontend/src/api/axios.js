// src/api/axios.js
import axios from 'axios';
import Cookies from 'js-cookie';
import jwtDecode from 'jwt-decode';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true, // send HttpOnly refresh token
});

let isRefreshing = false;
let subscribers = [];

const onRefreshed = (token) => {
  subscribers.forEach((cb) => cb(token));
  subscribers = [];
};

const addSubscriber = (cb) => {
  subscribers.push(cb);
};

api.interceptors.request.use(
  async (config) => {
    const accessToken = Cookies.get('accessToken');

    if (accessToken) {
      const decoded = jwtDecode(accessToken);
      const isExpired = decoded.exp * 1000 < Date.now();

      if (isExpired && !isRefreshing) {
        isRefreshing = true;

        try {
          const res = await axios.get('http://localhost:3000/api/auth/refresh-token', {
            withCredentials: true,
          });
          const newToken = res.data.accessToken;
          Cookies.set('accessToken', newToken);
          config.headers.Authorization = `Bearer ${newToken}`;
          onRefreshed(newToken);
        } catch (err) {
          console.error('Refresh failed:', err);
        } finally {
          isRefreshing = false;
        }
      } else if (isExpired && isRefreshing) {
        return new Promise((resolve) => {
          addSubscriber((token) => {
            config.headers.Authorization = `Bearer ${token}`;
            resolve(config);
          });
        });
      } else {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;