import axios from 'axios';

// Create a custom axios instance
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
  withCredentials: true, // This is crucial for sending/receiving httpOnly cookies
});

// Response interceptor for handling 401s (e.g. token expired) globally 
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // We could trigger a logout action here if the refresh token also expired
      console.error('Session expired or unauthorized');
    }
    return Promise.reject(error);
  }
);