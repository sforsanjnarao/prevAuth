// src/components/PrivateRoute.jsx
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = ({children}) => {
    const { isAuthenticated, userId } = useSelector((state) => state.auth);
  
    const isLoggedIn = isAuthenticated && userId;
  
    return isLoggedIn ? children: <Navigate to="/login" />;
  };

export default PrivateRoute;