import axios from 'axios';
import { toast } from 'sonner';

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
    // Global Error Handling
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      switch (status) {
        case 401:
          // Handled above (or retry failed)
          break;
        case 403:
          toast.error("Bạn không có quyền thực hiện thao tác này.");
          break;
        case 404:
          toast.error("Không tìm thấy dữ liệu yêu cầu.");
          break;
        case 409:
          toast.error(data?.message || "Đã xảy ra xung đột dữ liệu.");
          break;
        case 422:
        case 400:
          toast.error(data?.message || "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.");
          break;
        case 429:
          toast.error("Bạn thao tác quá nhanh. Vui lòng thử lại sau.");
          break;
        case 500:
        default:
          toast.error("Đã có lỗi hệ thống xảy ra. Vui lòng thử lại sau.");
          break;
      }
    } else if (error.request) {
      toast.error("Không thể kết nối máy chủ. Vui lòng thử lại.");
    }
    
    return Promise.reject(error);
  }
);
