// Model thao tác bảng readers (bổ sung đăng nhập)
const pool = require('../config/db');

const ReaderModel = {
  // Lấy danh sách độc giả, có hỗ trợ tìm kiếm theo tên
  async list(search = '') {
    if (search) {
      const [rows] = await pool.query(
        'SELECT reader_id, full_name, class, birth_date, gender FROM readers WHERE full_name LIKE ? ORDER BY reader_id DESC',
        [`%${search}%`]
      );
      return rows;
    }

    const [rows] = await pool.query(
      'SELECT reader_id, full_name, class, birth_date, gender FROM readers ORDER BY reader_id DESC'
    );
    return rows;
  },

  // Danh sách có phân trang + lọc
  async listPaged({ page, pageSize, search, gender }) {
    const where = [];
    const params = [];

    if (search) {
      where.push('(reader_id LIKE ? OR full_name LIKE ? OR class LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (gender) {
      where.push('gender = ?');
      params.push(gender);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [[countRow]] = await pool.query(
      `SELECT COUNT(*) AS total FROM readers ${whereSql}`,
      params
    );

    const offset = (page - 1) * pageSize;
    const [rows] = await pool.query(
      `SELECT reader_id, full_name, class, birth_date, gender
       FROM readers ${whereSql}
       ORDER BY reader_id DESC
       LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    return { items: rows, total: countRow.total };
  },

  // Lấy độc giả theo id (phục vụ reader profile)
  async findById(reader_id) {
    const [rows] = await pool.query(
      'SELECT reader_id, full_name, class, birth_date, gender FROM readers WHERE reader_id = ?',
      [reader_id]
    );
    return rows[0];
  },

  // Lấy độc giả theo id để đăng nhập (có password_hash)
  async findByIdWithPassword(reader_id) {
    const [rows] = await pool.query(
      'SELECT reader_id, full_name, class, birth_date, gender, password_hash FROM readers WHERE reader_id = ?',
      [reader_id]
    );
    return rows[0];
  },

  // Thêm độc giả mới (có thể kèm mật khẩu)
  async create(data) {
    const { reader_id, full_name, class: className, birth_date, gender, password_hash } = data;
    const [result] = await pool.query(
      'INSERT INTO readers (reader_id, full_name, class, birth_date, gender, password_hash) VALUES (?, ?, ?, ?, ?, ?)',
      [reader_id, full_name, className, birth_date, gender, password_hash || null]
    );
    return result.affectedRows;
  },

  // Cập nhật độc giả
  async update(reader_id, data) {
    const { full_name, class: className, birth_date, gender } = data;
    const [result] = await pool.query(
      'UPDATE readers SET full_name = ?, class = ?, birth_date = ?, gender = ? WHERE reader_id = ?',
      [full_name, className, birth_date, gender, reader_id]
    );
    return result.affectedRows;
  },

  // Cập nhật mật khẩu reader
  async updatePassword(reader_id, password_hash) {
    const [result] = await pool.query(
      'UPDATE readers SET password_hash = ? WHERE reader_id = ?',
      [password_hash, reader_id]
    );
    return result.affectedRows;
  },

  // Xóa độc giả
  async remove(reader_id) {
    const [result] = await pool.query('DELETE FROM readers WHERE reader_id = ?', [reader_id]);
    return result.affectedRows;
  }
};

module.exports = ReaderModel;