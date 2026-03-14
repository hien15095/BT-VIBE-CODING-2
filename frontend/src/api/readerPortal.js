// API cho portal sinh viên
import api from './axios';

const readerPortalApi = {
  listBooks: (search = '', category_id = '') =>
    api.get('/reader/books', { params: { search, category_id } }),
  myBorrow: () => api.get('/reader/borrow'),
  requestBorrow: (book_id) => api.post('/reader/requests', { book_id }),
  listRequests: (params = {}) => api.get('/reader/requests', { params }),
  cancelRequest: (id) => api.delete(`/reader/requests/${id}`),
  profile: () => api.get('/reader/profile'),
  changePassword: (data) => api.post('/reader/change-password', data),
  summary: () => api.get('/reader/summary')
};

export default readerPortalApi;
