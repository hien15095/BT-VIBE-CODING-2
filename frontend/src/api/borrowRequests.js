// API quản lý yêu cầu mượn sách
import api from './axios';

const borrowRequestsApi = {
  list: (params = {}) => api.get('/borrow-requests', { params }),
  approve: (id) => api.post(`/borrow-requests/${id}/approve`),
  reject: (id, note = '') => api.post(`/borrow-requests/${id}/reject`, { note })
};

export default borrowRequestsApi;
