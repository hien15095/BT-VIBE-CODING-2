// API cho bản sao sách
import api from './axios';

const copiesApi = {
  list: (params) => api.get('/copies', { params }),
  create: (data) => api.post('/copies', data),
  update: (id, data) => api.put(`/copies/${id}`, data),
  remove: (id) => api.delete(`/copies/${id}`),
  importCsv: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/copies/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

export default copiesApi;