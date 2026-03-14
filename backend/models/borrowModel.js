// Model thao tác bảng borrow_records
const pool = require('../config/db');

const BorrowModel = {
  // Lấy danh sách phiếu mượn (phục vụ báo cáo hoặc quản trị)
  async list() {
    const [rows] = await pool.query(
      `SELECT br.borrow_id, br.copy_id, br.reader_id, br.librarian_id,
              br.borrow_date, br.return_date, br.status, br.book_condition
       FROM borrow_records br
       ORDER BY br.borrow_id DESC`
    );
    return rows;
  },

  // Tạo phiếu mượn (logic chi tiết sẽ làm trong controller để dùng transaction)
  async create(conn, { copy_id, reader_id, librarian_id }) {
    const [result] = await conn.query(
      `INSERT INTO borrow_records (copy_id, reader_id, librarian_id, borrow_date, status)
       VALUES (?, ?, ?, NOW(), 'borrowed')`,
      [copy_id, reader_id, librarian_id]
    );
    return result.insertId;
  },

  // Cập nhật trả sách
  async markReturned({ borrow_id, book_condition }) {
    const [result] = await pool.query(
      `UPDATE borrow_records
       SET status = 'returned', return_date = NOW(), book_condition = ?
       WHERE borrow_id = ? AND status = 'borrowed'`,
      [book_condition || 'good', borrow_id]
    );
    return result.affectedRows;
  }
};

module.exports = BorrowModel;