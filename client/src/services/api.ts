import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const prevRequest = err.config;

    if (err.response?.status === 401 && !prevRequest?._retry) {
      if (prevRequest.url?.includes('/auth/login') || prevRequest.url?.includes('/auth/refresh-token')) {
        return Promise.reject(err);
      }

      prevRequest._retry = true;
      try {
        await axios.post(
          'http://localhost:5000/api/v1/auth/refresh-token',
          {},
          { withCredentials: true }
        );
        return api(prevRequest);
      } catch (e) {
        return Promise.reject(e);
      }
    }

    return Promise.reject(err);
  }
);

export default api;
