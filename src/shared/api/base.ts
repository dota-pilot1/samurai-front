import axios from 'axios';

export const api = axios.create({
    baseURL: 'http://localhost:3100', // Backend port
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
