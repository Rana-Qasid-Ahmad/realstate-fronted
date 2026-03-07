// ============================================================
// api.js — Axios instance for making API requests
// Axios = a library that makes HTTP requests easier than fetch()
// ============================================================

import axios from 'axios';

// Create an axios instance with a base URL
// All requests will be sent to this base URL automatically
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// -------------------------------------------------------
// Request Interceptor
// This runs BEFORE every request is sent
// We use it to attach the auth token to every request
// -------------------------------------------------------
api.interceptors.request.use((config) => {
  // Get the token saved in localStorage (saved during login)
  const token = localStorage.getItem('token');

  // If we have a token, add it to the Authorization header
  // The backend's protect middleware reads this header
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// -------------------------------------------------------
// Response Interceptor
// This runs when a response comes back
// We use it to handle auth errors globally
// -------------------------------------------------------
api.interceptors.response.use(
  // If the request was successful, just return the response as-is
  (response) => {
    return response;
  },
  // If there was an error...
  (error) => {
    // 401 = Unauthorized (token is expired or invalid)
    if (error.response && error.response.status === 401) {
      // Clear the saved login data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Don't redirect here — let the React components handle it
    }

    // Pass the error along so the calling code can handle it
    return Promise.reject(error);
  }
);

export default api;
