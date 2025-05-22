import React from 'react';
import { Routes, Route } from 'react-router-dom'; // Remove BrowserRouter from here
import HomePage from './views/Home/HomePage';
import Login from './views/Login';
import EmailVerify from './views/EmailVerify';
import ResetPassword from './views/ResetPassword';
import Register from './views/Register';
import PrivateRoute from './components/PrivateRoutes';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import VaultPage from './views/VaultPage';
import BreachCheckPage from './views/BreachCheckPage';
import FakeDataGeneratorPage from './views/FakeDataGeneratorPage';
import InboxViewPage from './views/InboxViewPage';
import AppTrackerPage from './views/AppTrackerPage';
import AppTrackerItem from './components/AppTrackerItem';
// import DashboardPage from './views/HomePage';
import Navbar from './components/Navbar';
import DashboardPage from './views/Dashboard';
import NotFound from './views/404NotFound/NotFound';
import Footer from './components/Footer';

function App() {
  return (
    <div className="flex flex-col min-h-screen max-w-screen overflow-x-hidden">
      {/* Navbar appears on every page */}
      <div className='fixed w-full z-30 top-0'>
        <Navbar />
      </div>
      
      {/* Main content area with padding to account for fixed navbar */}
      <main className="flex-grow pt-16"> {/* pt-16 matches navbar height */}
        <Routes>
          <Route path="/" element={<HomePage />} />

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/verify-email" element={<EmailVerify />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path='/vault' element={<VaultPage/>}/>
            <Route path='/breach-check' element={<BreachCheckPage/>}/>
            <Route path='/fakedata' element={<FakeDataGeneratorPage/>}/>
            <Route path='/fakedata/inbox/:id' element={<InboxViewPage/>}/> 
            <Route path='/app-tracker' element={<AppTrackerPage/>}/>
            <Route path='/app-tracker/:id' element={<AppTrackerItem/>}/>
            <Route path='/*' element={<NotFound/>}/>
          </Route>
        </Routes>
      </main>

{/* Footer */}
<Footer/>
      {/* Toast Container */}
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
        theme="dark"
      />
    </div>
  );
}

export default App;