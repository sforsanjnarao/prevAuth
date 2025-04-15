// src/components/LogoutButton.jsx
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearAuth, setLoading } from "../features/authSlice";
import { logoutUser } from "../api/authApi";
import { toast } from "react-toastify";

const LogoutButton = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    dispatch(setLoading(true));
    try {
      await logoutUser();
      dispatch(clearAuth());
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (err) {
      toast.error("Logout failed");
      console.error(err);
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <button onClick={handleLogout} className="text-red-500">Logout</button>
  );
};

export default LogoutButton;