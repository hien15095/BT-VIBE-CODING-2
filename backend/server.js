// Khởi tạo server Express cho hệ thống quản lý thư viện
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Cho phép CORS để frontend gọi API
app.use(cors());

// Parse JSON body từ client
app.use(express.json());

// Route kiểm tra server sống
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Gắn các route API chính
app.use('/api', routes);

// Middleware xử lý lỗi tập trung
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});