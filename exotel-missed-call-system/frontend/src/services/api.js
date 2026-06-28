import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor (can add headers if needed later, e.g. JWT tokens)
api.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
        logError(message, error);
        return Promise.reject(new Error(message));
    }
);

function logError(msg, err) {
    console.error(`[API Error]: ${msg}`, err);
}

export const callService = {
    getCalls: async (params = {}) => {
        const response = await api.get('/calls', { params });
        return response.data;
    },

    getCallById: async (id) => {
        const response = await api.get(`/calls/${id}`);
        return response.data;
    },

    updateCall: async (id, callData) => {
        const response = await api.put(`/calls/${id}`, callData);
        return response.data;
    },

    deleteCall: async (id) => {
        const response = await api.delete(`/calls/${id}`);
        return response.data;
    },

    searchCalls: async (q, params = {}) => {
        const response = await api.get('/calls/search', { params: { q, ...params } });
        return response.data;
    },

    getStatistics: async () => {
        const response = await api.get('/calls/statistics');
        return response.data;
    },

    syncCalls: async () => {
        const response = await api.get('/exotel/sync');
        return response.data;
    },
};

export default api;
