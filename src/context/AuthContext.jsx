// ============================================================
// AuthContext.jsx — Manages the logged-in user across the app
//
// React Context = a way to share data across all components
// without passing props down manually at every level
// ============================================================

import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

// Create the context (think of it as a "global variable" for React)
const AuthContext = createContext(null);


// ============================================================
// AuthProvider
// Wrap your whole app in this so every component can access auth
// ============================================================
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);    // The logged in user object (or null)
  const [loading, setLoading] = useState(true); // True while checking login status

  // -------------------------------------------------------
  // On first load: check if there's already a saved token
  // This keeps the user logged in after a page refresh
  // -------------------------------------------------------
  useEffect(() => {
    const token = localStorage.getItem('token');

    // If there's no token, nobody is logged in
    if (!token) {
      setLoading(false);
      return;
    }

    // If there is a token, verify it with the server and get the user's data
    api.get('/auth/me')
      .then((response) => {
        // Token is valid — save the user data
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
      })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          // Token is expired or invalid — clear everything
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        } else {
          // Network error (no internet) — restore user from localStorage
          const savedUser = localStorage.getItem('user');
          if (savedUser) {
            try {
              setUser(JSON.parse(savedUser));
            } catch {
              // localStorage data was corrupt, ignore it
            }
          }
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);


  // -------------------------------------------------------
  // login: called when user submits the login form
  // Sends email + password to the server, saves the token
  // -------------------------------------------------------
  async function login(email, password) {
    const response = await api.post('/auth/login', { email, password });

    const { token, user: userData } = response.data;

    // Save to localStorage so it persists after a page refresh
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));

    // Update React state
    setUser(userData);

    return userData;
  }


  // -------------------------------------------------------
  // loginWithToken: called after email verification
  // We already have the token from the verify response
  // -------------------------------------------------------
  function loginWithToken(userData, token) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  }


  // -------------------------------------------------------
  // logout: clear everything and log the user out
  // -------------------------------------------------------
  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }


  // -------------------------------------------------------
  // updateUser: update the user object (e.g. after profile edit)
  // -------------------------------------------------------
  function updateUser(newData) {
    const updatedUser = { ...user, ...newData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  }


  // The value object is what all child components can access
  const contextValue = {
    user,
    loading,
    login,
    loginWithToken,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}


// ============================================================
// useAuth — Custom hook to use auth in any component
// Usage: const { user, logout } = useAuth();
// ============================================================
export function useAuth() {
  return useContext(AuthContext);
}
