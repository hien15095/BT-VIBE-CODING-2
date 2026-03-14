// Model truy vấn cho trang sinh viên
const pool = require('../config/db');

const ReaderPortalModel = {
  // Danh sách đầu sách (join category)
  async listBooks(search = '', category_id = '') {
    const where = [];
    const params = [];

    if (search) {
      where.push(
        '(b.title LIKE ? OR b.author LIKE ? OR b.book_id LIKE ? OR c.category_name LIKE ?)'
      );
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (category_id) {
      where.push('b.category_id = ?');
      params.push(category_id);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [rows] = await pool.query(
      `SELECT b.book_id, b.title, b.author, b.publisher, c.category_name,
              SUM(CASE WHEN bc.status = 'available' THEN 1 ELSE 0 END) AS available_copies
       FROM books b
       LEFT JOIN categories c ON c.category_id = b.category_id
       LEFT JOIN book_copies bc ON bc.book_id = b.book_id
       ${whereSql}
       GROUP BY b.book_id, b.title, b.author, b.publisher, c.category_name
       ORDER BY b.book_id DESC`,
      params
    );
    return rows;
  },

  // Lấy tình trạng mượn của reader
  async myBorrow(reader_id) {
    const [rows] = await pool.query(
      `SELECT br.borrow_id, br.borrow_date, br.return_date, br.status,
              bc.copy_id, b.book_id, b.title
       FROM borrow_records br
       JOIN book_copies bc ON bc.copy_id = br.copy_id
       JOIN books b ON b.book_id = bc.book_id
       WHERE br.reader_id = ?
       ORDER BY br.borrow_date DESC`,
      [reader_id]
    );
    return rows;
  },

  // Đếm số bản sao available theo book_id
  async countAvailableCopies(book_id) {
    const [[row]] = await pool.query(
      'SELECT COUNT(*) AS total FROM book_copies WHERE book_id = ? AND status = ?',
      [book_id, 'available']
    );
    return row.total || 0;
  },

  // Tổng số đầu sách
  async countBooks() {
    const [[row]] = await pool.query('SELECT COUNT(*) AS total FROM books');
    return row.total || 0;
  },

  // Tổng bản sao available
  async countAvailableAll() {
    const [[row]] = await pool.query(
      'SELECT COUNT(*) AS total FROM book_copies WHERE status = ?',
      ['available']
    );
    return row.total || 0;
  },

  // Số sách đang mượn của reader
  async countBorrowedByReader(reader_id) {
    const [[row]] = await pool.query(
      'SELECT COUNT(*) AS total FROM borrow_records WHERE reader_id = ? AND status = ?',
      [reader_id, 'borrowed']
    );
    return row.total || 0;
  },

  // Số yêu cầu pending của reader
  async countPendingRequests(reader_id) {
    const [[row]] = await pool.query(
      'SELECT COUNT(*) AS total FROM borrow_requests WHERE reader_id = ? AND status = ?',
      [reader_id, 'pending']
    );
    return row.total || 0;
  }
};

module.exports = ReaderPortalModel;
