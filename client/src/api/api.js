import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true,
});

api.interceptors.request.use(req => req, err => Promise.reject(err));

// Response interceptor: refresh token if 401
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // call refresh token endpoint
        await axios.post('http://localhost:8080/api/users/refresh-token', {}, {
          withCredentials: true
        });

        // retry original request
        return api(originalRequest);
      } catch (refreshError) {
        // if refresh fails, redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;