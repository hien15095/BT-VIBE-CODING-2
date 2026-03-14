// Model thao tác bảng book_copies
const pool = require('../config/db');

const CopyModel = {
  // Lấy danh sách bản sao sách
  async list() {
    const [rows] = await pool.query(
      `SELECT bc.copy_id, bc.book_id, bc.status, bc.import_date, b.title
       FROM book_copies bc
       JOIN books b ON b.book_id = bc.book_id
       ORDER BY bc.copy_id DESC`
    );
    return rows;
  },

  // Danh sách có phân trang + lọc
  async listPaged({ page, pageSize, search, status }) {
    const where = [];
    const params = [];

    if (search) {
      where.push('(bc.book_id LIKE ? OR b.title LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (status) {
      where.push('bc.status = ?');
      params.push(status);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [[countRow]] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM book_copies bc
       JOIN books b ON b.book_id = bc.book_id
       ${whereSql}`,
      params
    );

    const offset = (page - 1) * pageSize;
    const [rows] = await pool.query(
      `SELECT bc.copy_id, bc.book_id, bc.status, bc.import_date, b.title
       FROM book_copies bc
       JOIN books b ON b.book_id = bc.book_id
       ${whereSql}
       ORDER BY bc.copy_id DESC
       LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    return { items: rows, total: countRow.total };
  },

  // Thêm bản sao sách
  async create(data) {
    const { book_id, status, import_date } = data;
    const [result] = await pool.query(
      'INSERT INTO book_copies (book_id, status, import_date) VALUES (?, ?, ?)',
      [book_id, status || 'available', import_date]
    );
    return result.insertId;
  },

  // Cập nhật trạng thái bản sao
  async update(copy_id, data) {
    const { status } = data;
    const [result] = await pool.query(
      'UPDATE book_copies SET status = ? WHERE copy_id = ?',
      [status, copy_id]
    );
    return result.affectedRows;
  },

  // Xóa bản sao
  async remove(copy_id) {
    const [result] = await pool.query('DELETE FROM book_copies WHERE copy_id = ?', [copy_id]);
    return result.affectedRows;
  }
};

module.exports = CopyModel;