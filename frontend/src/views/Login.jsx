// src/pages/Login.jsx
import { useDispatch,useSelector } from "react-redux";
import { loginUser } from "../api/authApi";
import { setAuth, setLoading } from "../features/authSlice";
import { toast } from "react-toastify";
import { useState } from "react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();

  const handleLogin = async (e) => {
    e.preventDefault();
    dispatch(setLoading(true));

    try {
        const loading = useSelector((state) => state.auth.loading);
      const res = await loginUser(email, password);
      dispatch(setAuth({ userId: res.userId}));
        toast.success("Login successful");
    } catch (err) {
        console.error("Login failed:", err.response?.data?.message || err.message);
        toast.error(err.response?.data?.message || "Login failed");
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
      <button type="submit" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
        </button>
    </form>
  );
};

export default Login;