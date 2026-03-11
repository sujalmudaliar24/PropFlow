import axios from 'axios';

let baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Ensure baseURL ends with /api/ to match backend routes
if (!baseURL.toLowerCase().endsWith('/api') && !baseURL.toLowerCase().endsWith('/api/')) {
    baseURL = baseURL.endsWith('/') ? `${baseURL}api/` : `${baseURL}/api/`;
} else if (!baseURL.endsWith('/')) {
    baseURL += '/';
}

console.log('API Base URL:', baseURL);

const API = axios.create({
    baseURL,
});

// Attach token to every request
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth API
export const registerUser = (data) => API.post('auth/register', data);
export const loginUser = (data) => API.post('auth/login', data);
export const verifyOtp = (data) => API.post('auth/verify-otp', data);
export const getProfile = () => API.get('auth/me');

// Property API
export const getProperties = (params) => API.get('properties', { params });
export const searchProperties = (params) => API.get('properties/search', { params });
export const createProperty = (data) => API.post('properties', data);
export const updateProperty = (id, data) => API.put(`properties/${id}`, data);
export const deleteProperty = (id) => API.delete(`properties/${id}`);
export const shareProperties = (data) => API.post('properties/share', data);

export default API;
