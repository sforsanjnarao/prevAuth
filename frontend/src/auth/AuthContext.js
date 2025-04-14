// /auth/AuthContext.jsx
import { createContext, useContext, useState } from 'react';
import Cookies from 'js-cookie';
import jwtDecode from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const token = Cookies.get('accessToken');
    return token ? jwtDecode(token) : null;
  });

  const login = (token) => {
    Cookies.set('accessToken', token);
    setUser(jwtDecode(token));
  };

  const logout = async () => {
    await api.post('/auth/logout');
    Cookies.remove('accessToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);