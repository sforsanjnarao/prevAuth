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
import VaultPage from './views/VaultPage'
import BreachCheckPage from './views/BreachCheckPage'
import FakeDataGeneratorPage from './views/FakeDataGeneratorPage'
import InboxViewPage from './views/InboxViewPage'

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
        <ToastContainer
            position="top-right"  
            autoClose={3000} 
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark" // Or 'dark', 'colored'
      />

        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-email" element={<EmailVerify />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/register" element={<Register />} />
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path='/vault' element={<VaultPage/>}/>
            <Route path='/breach-check' element={<BreachCheckPage/>}/>
            <Route path='/fakedata' element={<FakeDataGeneratorPage/>}/>
            <Route path='/fakedata/inbox/:id' element={<InboxViewPage/>}/>
          </Route>
          
        </Routes>

       
    </div>
  )
}
  
export default App