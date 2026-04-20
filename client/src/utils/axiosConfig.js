import axios from 'axios';

const ServerUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Set global axios defaults so all axios instances use credentials
axios.defaults.baseURL = ServerUrl;
axios.defaults.withCredentials = true;
axios.defaults.timeout = 30000; // 30 second timeout
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['Accept'] = 'application/json';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: ServerUrl,
  withCredentials: true, // IMPORTANT: Send cookies with every request
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add request interceptor for debugging
axiosInstance.interceptors.request.use(
  config => {
    // Don't override Content-Type for FormData (let browser set boundary)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
      console.log(`[${new Date().toISOString()}] API Request: ${config.method.toUpperCase()} ${config.url}`);
      console.log(`  withCredentials: ${config.withCredentials}, Data: multipart/form-data`);
    } else {
      console.log(`[${new Date().toISOString()}] API Request: ${config.method.toUpperCase()} ${config.url}`);
      console.log(`  withCredentials: ${config.withCredentials}, Data:`, config.data);
    }
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
    console.log(`[${new Date().toISOString()}] API Response: ${response.status} from ${response.config.url}`);
    console.log(`  Response headers:`, response.headers);
    return response;
  },
  error => {
    console.error(`[${new Date().toISOString()}] API Error: ${error.response?.status || error.code} from ${error.config?.url}`);
    console.error(`  Error response:`, error.response?.data);
    
    // Better error messages for timeout issues
    if (error.code === 'ECONNABORTED') {
      console.error("Request timeout - server took too long to respond");
    }
    if (error.response?.status === 503) {
      console.error("Server is temporarily unavailable");
    }
    if (error.response?.status === 413) {
      console.error("File too large - please upload a smaller file");
    }
    if (error.response?.status === 401) {
      console.error("Unauthorized - user not authenticated. Cookies:", document.cookie);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
