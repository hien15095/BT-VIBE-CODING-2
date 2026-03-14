// Model thao tác bảng users
const pool = require('../config/db');

const UserModel = {
  // Lấy user theo username để đăng nhập
  async findByUsername(username) {
    const [rows] = await pool.query(
      'SELECT user_id, username, password_hash, role FROM users WHERE username = ?',
      [username]
    );
    return rows[0];
  },

  // Lấy danh sách user (không trả password)
  async list() {
    const [rows] = await pool.query(
      'SELECT user_id, username, role, created_at FROM users ORDER BY user_id DESC'
    );
    return rows;
  },

  // Danh sách có phân trang + lọc
  async listPaged({ page, pageSize, search, role }) {
    const where = [];
    const params = [];

    if (search) {
      where.push('(username LIKE ? OR role LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (role) {
      where.push('role = ?');
      params.push(role);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [[countRow]] = await pool.query(
      `SELECT COUNT(*) AS total FROM users ${whereSql}`,
      params
    );

    const offset = (page - 1) * pageSize;
    const [rows] = await pool.query(
      `SELECT user_id, username, role, created_at
       FROM users ${whereSql}
       ORDER BY user_id DESC
       LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    return { items: rows, total: countRow.total };
  },

  // Lấy user theo id (dùng khi cập nhật)
  async findById(user_id) {
    const [rows] = await pool.query(
      'SELECT user_id, username, password_hash, role FROM users WHERE user_id = ?',
      [user_id]
    );
    return rows[0];
  },

  // Tạo user mới
  async create({ username, password_hash, role }) {
    const [result] = await pool.query(
      'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
      [username, password_hash, role]
    );
    return result.insertId;
  },

  // Cập nhật user
  async update(user_id, { username, password_hash, role }) {
    const [result] = await pool.query(
      'UPDATE users SET username = ?, password_hash = ?, role = ? WHERE user_id = ?',
      [username, password_hash, role, user_id]
    );
    return result.affectedRows;
  },

  // Xóa user
  async remove(user_id) {
    const [result] = await pool.query('DELETE FROM users WHERE user_id = ?', [user_id]);
    return result.affectedRows;
  }
};

module.exports = UserModel;