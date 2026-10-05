import { createContext, useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("jwtToken") || null);
  const [loading, setLoading] = useState(true);

  // Set default axios header if token exists
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      localStorage.setItem("jwtToken", token);
      
      // Optionally fetch user profile to get user info if not available
      if (!user) {
        axios.get(`${API_BASE_URL}/api/users/profile`)
          .then(res => {
            setUser(res.data);
          })
          .catch(err => {
            console.error("Token invalid or expired", err);
            logout();
          })
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    } else {
      delete axios.defaults.headers.common["Authorization"];
      localStorage.removeItem("jwtToken");
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const login = (userData, jwtToken) => {
    setToken(jwtToken);
    setUser(userData);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("jwtToken");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
