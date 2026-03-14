// API cho độc giả
import api from './axios';

const readersApi = {
  // Server-side pagination
  list: (params) => api.get('/readers', { params }),
  create: (data) => api.post('/readers', data),
  update: (id, data) => api.put(`/readers/${id}`, data),
  remove: (id) => api.delete(`/readers/${id}`),
  importCsv: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/readers/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

export default readersApi;