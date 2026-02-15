import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const res = await axios.post(
        `${process.env.REACT_APP_API_URL}refresh-token`,
          {},
          { withCredentials: true }
        );

        const newToken = res.data.accessToken;
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;

        return api(originalRequest);
      } catch (err) {
        console.log('Session expired, redirecting to login...');
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;