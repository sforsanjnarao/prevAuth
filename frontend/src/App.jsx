import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './views/Home'
import Login from './views/Login'
import EmailVerify from './views/EmailVerify'
import ResetPassword from './views/ResetPassword'

function App() {
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