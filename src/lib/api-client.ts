import axios from 'axios';

// The ASP.NET Core API usually runs on localhost:5235 (HTTP) or 7080 (HTTPS) in development
// For this environment, we'll assume it's running on HTTP port 5235.
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5235/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    // If the backend wraps the response in a BaseResponse (e.g. { success, message, data }),
    // we can return response.data to simplify downstream usage, but to avoid breaking types,
    // we just return the full response and let components unwrap response.data.data
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized globally
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('No refresh token');
        
        // Try to refresh token
        const response = await axios.post(`${API_URL}/auth/refresh-token`, {
          token: refreshToken
        });
        
        const { token: newAccessToken, refreshToken: newRefreshToken } = response.data.data;
        
        localStorage.setItem('access_token', newAccessToken);
        localStorage.setItem('refresh_token', newRefreshToken);
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, force logout
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
