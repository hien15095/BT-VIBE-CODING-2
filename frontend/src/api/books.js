// API cho đầu sách
import api from './axios';

const booksApi = {
  list: (params) => api.get('/books', { params }),
  create: (data) => api.post('/books', data),
  update: (id, data) => api.put(`/books/${id}`, data),
  remove: (id) => api.delete(`/books/${id}`),
  importCsv: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/books/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

export default booksApi;