// /pages/LoginPage.jsx
import { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../auth/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.accessToken);
    } catch (err) {
      console.error(err.response.data.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <input type="password" onChange={(e) => setForm({ ...form, password: e.target.value })} />
      <button type="submit">Login</button>
    </form>
  );
}