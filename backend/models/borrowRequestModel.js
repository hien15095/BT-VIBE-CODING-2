// Model thao tác bảng borrow_requests
const pool = require('../config/db');

const BorrowRequestModel = {
  // Tạo yêu cầu mượn mới
  async create({ reader_id, book_id }) {
    const [result] = await pool.query(
      'INSERT INTO borrow_requests (reader_id, book_id) VALUES (?, ?)',
      [reader_id, book_id]
    );
    return result.insertId;
  },

  // Kiểm tra độc giả đã có sách đang mượn hoặc đang có yêu cầu pending
  async hasActiveBorrowOrPending(reader_id) {
    const [[borrowRow]] = await pool.query(
      'SELECT COUNT(*) AS total FROM borrow_records WHERE reader_id = ? AND status = ?',
      [reader_id, 'borrowed']
    );

    const [[pendingRow]] = await pool.query(
      'SELECT COUNT(*) AS total FROM borrow_requests WHERE reader_id = ? AND status = ?',
      [reader_id, 'pending']
    );

    return borrowRow.total > 0 || pendingRow.total > 0;
  },

  // Lấy danh sách yêu cầu (có phân trang, lọc) - dùng cho staff
  async listPaged({ page, pageSize, search, status }) {
    const where = [];
    const params = [];

    if (search) {
      where.push('(r.reader_id LIKE ? OR rd.full_name LIKE ? OR b.title LIKE ? OR b.book_id LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status) {
      where.push('r.status = ?');
      params.push(status);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [[countRow]] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM borrow_requests r
       JOIN readers rd ON rd.reader_id = r.reader_id
       JOIN books b ON b.book_id = r.book_id
       ${whereSql}`,
      params
    );

    const offset = (page - 1) * pageSize;
    const [rows] = await pool.query(
      `SELECT r.request_id, r.reader_id, rd.full_name, r.book_id, b.title,
              r.status, r.request_date, r.processed_by, r.processed_at, r.note
       FROM borrow_requests r
       JOIN readers rd ON rd.reader_id = r.reader_id
       JOIN books b ON b.book_id = r.book_id
       ${whereSql}
       ORDER BY r.request_date DESC
       LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    return { items: rows, total: countRow.total };
  },

  // Lấy yêu cầu theo id
  async findById(request_id) {
    const [rows] = await pool.query(
      'SELECT request_id, reader_id, book_id, status FROM borrow_requests WHERE request_id = ?',
      [request_id]
    );
    return rows[0];
  },

  // Cập nhật trạng thái yêu cầu
  async updateStatus(request_id, { status, processed_by, note }) {
    const [result] = await pool.query(
      `UPDATE borrow_requests
       SET status = ?, processed_by = ?, processed_at = NOW(), note = ?
       WHERE request_id = ?`,
      [status, processed_by, note || null, request_id]
    );
    return result.affectedRows;
  },

  // Danh sách yêu cầu theo reader (có phân trang + lọc)
  async listByReaderPaged({ reader_id, page, pageSize, status }) {
    const where = ['r.reader_id = ?'];
    const params = [reader_id];

    if (status) {
      where.push('r.status = ?');
      params.push(status);
    }

    const whereSql = `WHERE ${where.join(' AND ')}`;

    const [[countRow]] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM borrow_requests r
       JOIN books b ON b.book_id = r.book_id
       ${whereSql}`,
      params
    );

    const offset = (page - 1) * pageSize;
    const [rows] = await pool.query(
      `SELECT r.request_id, r.book_id, b.title,
              r.status, r.request_date, r.processed_at, r.note
       FROM borrow_requests r
       JOIN books b ON b.book_id = r.book_id
       ${whereSql}
       ORDER BY r.request_date DESC
       LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    return { items: rows, total: countRow.total };
  },

  // Hủy yêu cầu (chỉ khi pending và đúng reader)
  async cancelByReader(request_id, reader_id) {
    const [result] = await pool.query(
      `DELETE FROM borrow_requests
       WHERE request_id = ? AND reader_id = ? AND status = 'pending'`,
      [request_id, reader_id]
    );
    return result.affectedRows;
  }
};

module.exports = BorrowRequestModel;
