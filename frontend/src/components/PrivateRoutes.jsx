// src/components/PrivateRoute.jsx
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const accessToken = useSelector(state => state.auth.accessToken);

  return accessToken ? children : <Navigate to="/login" />;
};

export default PrivateRoute;