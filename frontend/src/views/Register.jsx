import { useState } from "react";
import { useDispatch,useSelector } from "react-redux";
import { registerUser } from "../api/authApi";
import { toast } from "react-toastify";
import { setAuth, setLoading } from "../features/authSlice";

const Register = () => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const loading = useSelector((state) => state.auth.loading);


  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(setLoading(true));
    try {
      const res = await registerUser(formData.name, formData.email, formData.password);
      dispatch(setAuth({ userId: res.data.userId }));
      toast.success("Registration successful");
    } catch (err) {
        console.error("register failed:", err.response?.data?.message || err.message);
        toast.error(err.response?.data?.message || "Register failed");
      }finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input name="name" type="text" onChange={handleChange} value={formData.name} placeholder="Name" required />
      <input name="email" type="email" onChange={handleChange} value={formData.email} placeholder="Email" required />
      <input name="password" type="password" onChange={handleChange} value={formData.password} placeholder="Password" required />
      <button type="submit" disabled={loading}>
  {loading ? "getting you IN" : "Register"}
</button>
    </form>
  );
};

export default Register;