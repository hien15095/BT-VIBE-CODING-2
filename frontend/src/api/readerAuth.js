// API đăng nhập cho sinh viên
import api from './axios';

export const readerLoginApi = (payload) => api.post('/reader-auth/login', payload);