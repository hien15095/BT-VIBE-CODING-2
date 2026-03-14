// Controller báo cáo thống kê
const pool = require('../config/db');

const ReportsController = {
  // Tổng quan số liệu
  async summary(req, res, next) {
    try {
      const [[readers]] = await pool.query('SELECT COUNT(*) AS total FROM readers');
      const [[books]] = await pool.query('SELECT COUNT(*) AS total FROM books');
      const [[copies]] = await pool.query('SELECT COUNT(*) AS total FROM book_copies');
      const [[borrowing]] = await pool.query(
        "SELECT COUNT(*) AS total FROM borrow_records WHERE status = 'borrowed'"
      );
      const [[borrowedAll]] = await pool.query('SELECT COUNT(*) AS total FROM borrow_records');

      res.json({
        readers: readers.total,
        books: books.total,
        copies: copies.total,
        borrowing: borrowing.total,
        totalBorrowRecords: borrowedAll.total
      });
    } catch (err) {
      next(err);
    }
  },

  // Xu hướng mượn theo tháng (6 tháng gần nhất)
  async borrowTrend(req, res, next) {
    try {
      const [rows] = await pool.query(
        `SELECT DATE_FORMAT(borrow_date, '%Y-%m') AS ym, COUNT(*) AS total
         FROM borrow_records
         WHERE borrow_date >= DATE_SUB(CURDATE(), INTERVAL 5 MONTH)
         GROUP BY ym
         ORDER BY ym ASC`
      );

      // Tạo đủ 6 tháng gần nhất
      const result = [];
      const map = new Map(rows.map((r) => [r.ym, r.total]));
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        result.push({ ym, total: map.get(ym) || 0 });
      }

      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  // Báo cáo sách mượn nhiều nhất
  async mostBorrowed(req, res, next) {
    try {
      const limit = parseInt(req.query.limit || '10', 10);
      const [rows] = await pool.query(
        `SELECT b.book_id, b.title, COUNT(br.borrow_id) AS total_borrowed
         FROM books b
         JOIN book_copies bc ON bc.book_id = b.book_id
         JOIN borrow_records br ON br.copy_id = bc.copy_id
         GROUP BY b.book_id, b.title
         ORDER BY total_borrowed DESC
         LIMIT ?`,
        [limit]
      );

      res.json(rows);
    } catch (err) {
      next(err);
    }
  },

  // Báo cáo độc giả chưa trả sách
  async unreturned(req, res, next) {
    try {
      const [rows] = await pool.query(
        `SELECT br.borrow_id, br.borrow_date, r.reader_id, r.full_name,
                bc.copy_id, b.book_id, b.title
         FROM borrow_records br
         JOIN readers r ON r.reader_id = br.reader_id
         JOIN book_copies bc ON bc.copy_id = br.copy_id
         JOIN books b ON b.book_id = bc.book_id
         WHERE br.status = 'borrowed'
         ORDER BY br.borrow_date DESC`
      );

      res.json(rows);
    } catch (err) {
      next(err);
    }
  }
};

module.exports = ReportsController;