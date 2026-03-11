// Frontend API Configuration
// Place this in your frontend project (e.g., src/api/config.js or src/services/api.js)

export const API_BASE_URL = 'http://127.0.0.1:8000/api/skill';

// ============================================
// AUTHENTICATION ENDPOINTS
// ============================================

export const AUTH_ENDPOINTS = {
  REGISTER: `${API_BASE_URL}/register/`,
  LOGIN: `${API_BASE_URL}/token/`,
  REFRESH: `${API_BASE_URL}/token/refresh/`,
  ME: `${API_BASE_URL}/me/`,
};

// ============================================
// COURSE ENDPOINTS
// ============================================

export const COURSE_ENDPOINTS = {
  CREATE: `${API_BASE_URL}/courses/create/`,
  MY_COURSES: `${API_BASE_URL}/courses/my/`,
};

// ============================================
// ADMIN ENDPOINTS
// ============================================

export const ADMIN_ENDPOINTS = {
  STATS: `${API_BASE_URL}/admin/stats/`,
  ACTIVITY: `${API_BASE_URL}/admin/activity/`,
  PENDING_COURSES: `${API_BASE_URL}/admin/courses/pending/`,
  UPDATE_COURSE_STATUS: (courseId) => `${API_BASE_URL}/admin/courses/${courseId}/status/`,
};

// ============================================
// HELPER: Fetch with JWT Token
// ============================================

export const fetchWithToken = async (url, options = {}) => {
  const token = localStorage.getItem('access_token');
  
  const headers = {
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // If unauthorized, try to refresh token
    if (response.status === 401 && localStorage.getItem('refresh_token')) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        return fetchWithToken(url, options); // Retry request
      }
    }

    return response;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};

// ============================================
// HELPER: Refresh Access Token
// ============================================

export const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refresh_token');
  
  if (!refreshToken) return false;

  try {
    const response = await fetch(AUTH_ENDPOINTS.REFRESH, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('access_token', data.access);
      return true;
    }
    
    // Clear tokens if refresh failed
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    return false;
  } catch (error) {
    console.error('Token refresh error:', error);
    return false;
  }
};

// ============================================
// HELPER: Register User
// ============================================

export const registerUser = async (userData) => {
  const formData = new FormData();
  formData.append('name', userData.name);
  formData.append('email', userData.email);
  formData.append('password', userData.password);
  formData.append('confirm_password', userData.confirm_password);
  formData.append('bio', userData.bio || '');
  
  if (userData.profile_pic) {
    formData.append('profile_pic', userData.profile_pic);
  }

  try {
    const response = await fetch(AUTH_ENDPOINTS.REGISTER, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(JSON.stringify(errorData));
    }

    return await response.json();
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// ============================================
// HELPER: Login User
// ============================================

export const loginUser = async (email, password) => {
  try {
    const response = await fetch(AUTH_ENDPOINTS.LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(JSON.stringify(errorData));
    }

    const data = await response.json();
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// ============================================
// HELPER: Get Current User
// ============================================

export const getCurrentUser = async () => {
  try {
    const response = await fetchWithToken(AUTH_ENDPOINTS.ME);

    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }

    return await response.json();
  } catch (error) {
    console.error('Get current user error:', error);
    throw error;
  }
};

// ============================================
// EXAMPLE: React Hook for Registration
// ============================================

/*
import { useState } from 'react';
import { registerUser } from './api/config';

function RegisterComponent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRegister = async (formData) => {
    setLoading(true);
    setError(null);

    try {
      const result = await registerUser(formData);
      console.log('Registration successful:', result);
      // Redirect to login or auto-login
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Your component JSX here
  );
}

export default RegisterComponent;
*/
