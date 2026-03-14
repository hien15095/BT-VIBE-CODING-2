// API báo cáo thống kê
import api from './axios';

const reportsApi = {
  summary: () => api.get('/reports/summary'),
  borrowTrend: () => api.get('/reports/borrow-trend'),
  mostBorrowed: (limit = 10) => api.get('/reports/most-borrowed', { params: { limit } }),
  unreturned: () => api.get('/reports/unreturned')
};

export default reportsApi;