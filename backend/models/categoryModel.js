// Model thao tác bảng categories
const pool = require('../config/db');

const CategoryModel = {
  // Lấy danh sách chuyên ngành
  async list() {
    const [rows] = await pool.query('SELECT * FROM categories ORDER BY category_id DESC');
    return rows;
  },

  // Danh sách có phân trang + tìm kiếm
  async listPaged({ page, pageSize, search }) {
    const where = [];
    const params = [];

    if (search) {
      where.push('(category_name LIKE ? OR description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [[countRow]] = await pool.query(
      `SELECT COUNT(*) AS total FROM categories ${whereSql}`,
      params
    );

    const offset = (page - 1) * pageSize;
    const [rows] = await pool.query(
      `SELECT * FROM categories ${whereSql}
       ORDER BY category_id DESC
       LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    return { items: rows, total: countRow.total };
  },

  // Thêm chuyên ngành mới
  async create(data) {
    const { category_name, description } = data;
    const [result] = await pool.query(
      'INSERT INTO categories (category_name, description) VALUES (?, ?)',
      [category_name, description || null]
    );
    return result.insertId;
  },

  // Cập nhật chuyên ngành
  async update(category_id, data) {
    const { category_name, description } = data;
    const [result] = await pool.query(
      'UPDATE categories SET category_name = ?, description = ? WHERE category_id = ?',
      [category_name, description || null, category_id]
    );
    return result.affectedRows;
  },

  // Xóa chuyên ngành
  async remove(category_id) {
    const [result] = await pool.query('DELETE FROM categories WHERE category_id = ?', [category_id]);
    return result.affectedRows;
  }
};

module.exports = CategoryModel;