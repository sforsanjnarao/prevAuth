// src/components/PrivateRoute.jsx
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = () => {
    const { isAuthenticated, userId } = useSelector((state) => state.auth);
    // console.log(state.auth)
    console.log(`isAuthenticated: ${isAuthenticated}, userId: ${userId}`);
  
    const isLoggedIn = isAuthenticated && userId;
  
    return isLoggedIn ? <Outlet /> : <Navigate to="/login" />;
  };

export default PrivateRoute;