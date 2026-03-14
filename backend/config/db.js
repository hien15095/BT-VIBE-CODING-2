// Kết nối MySQL bằng pool để tái sử dụng connection
const mysql = require('mysql2/promise');

// Đọc cấu hình từ biến môi trường
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;