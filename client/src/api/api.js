import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    const skipRetry = ['users/userid', 'users/login', 'users/refresh-token'];
    const shouldSkip = skipRetry.some(url => originalRequest.url.includes(url));

    if (error.response?.status === 401 && !originalRequest._retry && !shouldSkip) {
      originalRequest._retry = true;

      try {
        await axios.post(`${process.env.REACT_APP_API_URL}users/refresh-token`, {}, {
          withCredentials: true
        });
        return api(originalRequest);
      } catch (refreshError) {
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;