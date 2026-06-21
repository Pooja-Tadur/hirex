import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api';
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on page load
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${API}/auth/me`, {
          withCredentials: true,
          timeout: 5000
        });
        setUser(res.data.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const login = async (email, password) => {
    const res = await axios.post(`${API}/auth/login`,
      { email, password },
      { withCredentials: true }
    );
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (name, email, password, role) => {
    const res = await axios.post(`${API}/auth/register`,
      { name, email, password, role },
      { withCredentials: true }
    );
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = async () => {
    await axios.post(`${API}/auth/logout`, {}, { withCredentials: true });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);