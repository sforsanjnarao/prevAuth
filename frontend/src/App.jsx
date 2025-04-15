import React from 'react'
import {BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './views/Home'
import Login from './views/Login'
import EmailVerify from './views/EmailVerify'
import ResetPassword from './views/ResetPassword'
import Register from './views/Register'
import Dashboard from './views/Dashboard'
import PrivateRoute from './components/PrivateRoutes'
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  // const { login } = useAuth();

  // useEffect(() => {
  //   const refreshAccessToken = async () => {
  //     try {
  //       const res = await api.get('/auth/refresh');
  //       login(res.data.accessToken);
  //     } catch (err) {
  //       console.log("Session expired or user not logged in");
  //     }
  //   };
  //   refreshAccessToken();
  // }, []);
  return (
    <div>
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-email" element={<EmailVerify />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/register" element={<Register />} />
          <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        </Routes>
        <ToastContainer position="top-center" />

       
    </div>
  )
}
  
export default App