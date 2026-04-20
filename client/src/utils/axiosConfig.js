import axios from 'axios';

const ServerUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Set global axios defaults so all axios instances use credentials
axios.defaults.baseURL = ServerUrl;
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['Accept'] = 'application/json';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: ServerUrl,
  withCredentials: true, // IMPORTANT: Send cookies with every request
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add request interceptor for debugging
axiosInstance.interceptors.request.use(
  config => {
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  error => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
axiosInstance.interceptors.response.use(
  response => {
    console.log(`API Response: ${response.status} from ${response.config.url}`);
    return response;
  },
  error => {
    console.error(`API Error: ${error.response?.status} from ${error.config?.url}`);
    return Promise.reject(error);
  }
);

export default axiosInstance;
