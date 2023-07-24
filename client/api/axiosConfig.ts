import axios from 'axios';
import jwtDecode from 'jwt-decode';
import { getAccessToken, getRefreshToken, saveAccessToken } from '../utils/tokenUtils';
import { API_BASE_URL, API_JWT_TOKEN_PATH } from './apiConfig';

let isRefreshing = false;

const axiosInstance = axios.create({
  baseURL: `${API_BASE_URL}${API_JWT_TOKEN_PATH}`, // Replace with your API base URL
});

const handleTokenRefresh = async () => {
  try {
    const refreshToken = await getRefreshToken();
    const response = await axios.post('/api/token/refresh/', {
      refresh: refreshToken,
    });
    if (response.status === 200) {
      await saveAccessToken(response.data);
    }
  } catch (error: any) {
    // If token refresh fails, logout the user or handle the error appropriately
    // await logoutUser(); // Implement a function to log out the user
    console.log(error.message);
    throw error;
  }
};

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      const originalRequest = error.config;
      const token = await getAccessToken();
      if (
        error.response.status === 401 && // Unauthorized error
        token &&
        !originalRequest._retry // Avoid infinite retry loop
      ) {
        try {
          originalRequest._retry = true;
          const decodedToken: any = jwtDecode(token);
          const currentTime = Date.now() / 1000;
          if (decodedToken.exp < currentTime) {
            // Token has expired, attempt to refresh the token
            if (!isRefreshing) {
              isRefreshing = true;
              await handleTokenRefresh();
              isRefreshing = false;
              originalRequest.headers['Authorization'] = `Bearer ${await getAccessToken()}`;
              return axiosInstance(originalRequest);
            } else {
              // If another request is already refreshing the token, wait for it to complete
              await new Promise((resolve) => setTimeout(resolve, 100));
              originalRequest.headers['Authorization'] = `Bearer ${await getAccessToken()}`;
              return axiosInstance(originalRequest);
            }
          }
        } catch (decodeError) {
          console.error('JWT decode error:', decodeError);
        }
      }
      return Promise.reject(error);
    }
  );

export default axiosInstance;
