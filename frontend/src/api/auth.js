// API đăng nhập
import api from './axios';

export const loginApi = (payload) => api.post('/auth/login', payload);