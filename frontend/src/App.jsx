import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './views/Home'
import Login from './views/Login'
import EmailVerify from './views/EmailVerify'
import ResetPassword from './views/ResetPassword'

function App() {
  const { login } = useAuth();

  useEffect(() => {
    const refreshAccessToken = async () => {
      try {
        const res = await api.get('/auth/refresh');
        login(res.data.accessToken);
      } catch (err) {
        console.log("Session expired or user not logged in");
      }
    };
    refreshAccessToken();
  }, []);
  return (
    <div>
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/login" element={<Login />} />
  <Route path="/email-verify" element={<EmailVerify />} />
  <Route path="/reset-password" element={<ResetPassword />} />


</Routes>
    </div>
  )
}

export default App