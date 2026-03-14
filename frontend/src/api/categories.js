// API cho chuyên ngành
import api from './axios';

const categoriesApi = {
  list: (params) => api.get('/categories', { params }),
  listAll: () => api.get('/categories', { params: { all: '1' } }),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  remove: (id) => api.delete(`/categories/${id}`),
  importCsv: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/categories/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

export default categoriesApi;