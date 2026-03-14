// Script tạo tài khoản admin ban đầu
// Chạy: node scripts/createAdmin.js admin 123456 admin
require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

(async () => {
  try {
    const username = process.argv[2] || 'admin';
    const password = process.argv[3] || '123456';
    const role = process.argv[4] || 'admin';

    // Kiểm tra user đã tồn tại chưa
    const [rows] = await pool.query('SELECT user_id FROM users WHERE username = ?', [username]);

    // Hash mật khẩu
    const password_hash = await bcrypt.hash(password, 10);

    if (rows.length > 0) {
      // Nếu đã có user -> cập nhật lại mật khẩu/role để đăng nhập được
      await pool.query(
        'UPDATE users SET password_hash = ?, role = ? WHERE username = ?',
        [password_hash, role, username]
      );

      console.log('User da ton tai, da cap nhat mat khau');
      process.exit(0);
    }

    await pool.query(
      'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
      [username, password_hash, role]
    );

    console.log('Tao user thanh cong');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
