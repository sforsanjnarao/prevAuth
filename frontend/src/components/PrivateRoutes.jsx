// src/components/PrivateRoute.jsx
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = () => {
  useSelector((state) => {
    console.log (state.auth)
  })
    const { isAuthenticated, userId } = useSelector((state) => state.auth);
     console.log(isAuthenticated, userId)
    console.log(`isAuthenticated: ${isAuthenticated}, userId: ${userId}`);
  
    const isLoggedIn = isAuthenticated && userId;
  
    return isLoggedIn ? <Outlet /> : <Navigate to="/login" />;
  };

export default PrivateRoute;