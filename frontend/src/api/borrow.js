// API mượn và trả sách
import api from './axios';

const borrowApi = {
  borrow: (data) => api.post('/borrow', data),
  returnBook: (data) => api.post('/return', data)
};

export default borrowApi;
