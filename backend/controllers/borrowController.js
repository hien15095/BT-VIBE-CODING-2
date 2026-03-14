// Controller xử lý mượn và trả sách
const pool = require('../config/db');
const BorrowModel = require('../models/borrowModel');

const BorrowController = {
  // Tạo phiếu mượn
  async borrow(req, res, next) {
    const conn = await pool.getConnection();
    try {
      const { copy_id, reader_id } = req.body;
      const librarian_id = req.user.user_id;

      if (!copy_id || !reader_id) {
        return res.status(400).json({ message: 'Thieu thong tin bat buoc' });
      }

      await conn.beginTransaction();

      // Khóa bản sao để tránh race condition
      const [copies] = await conn.query(
        'SELECT status FROM book_copies WHERE copy_id = ? FOR UPDATE',
        [copy_id]
      );

      if (copies.length === 0) {
        await conn.rollback();
        return res.status(404).json({ message: 'Khong tim thay ban sao' });
      }

      if (copies[0].status !== 'available') {
        await conn.rollback();
        return res.status(400).json({ message: 'Ban sao khong co san' });
      }

      // Kiểm tra độc giả đã mượn sách chưa
      const [borrowed] = await conn.query(
        'SELECT 1 FROM borrow_records WHERE reader_id = ? AND status = "borrowed" FOR UPDATE',
        [reader_id]
      );

      if (borrowed.length > 0) {
        await conn.rollback();
        return res.status(400).json({ message: 'Doc gia da muon 1 cuon sach' });
      }

      const borrow_id = await BorrowModel.create(conn, { copy_id, reader_id, librarian_id });

      // Trigger trong DB sẽ cập nhật trạng thái bản sao
      await conn.commit();

      res.status(201).json({ message: 'Tao phieu muon thanh cong', borrow_id });
    } catch (err) {
      await conn.rollback();
      next(err);
    } finally {
      conn.release();
    }
  },

  // Trả sách
  async returnBook(req, res, next) {
    try {
      const { borrow_id, book_condition } = req.body;
      if (!borrow_id) {
        return res.status(400).json({ message: 'Thieu borrow_id' });
      }

      const affected = await BorrowModel.markReturned({ borrow_id, book_condition });
      if (affected === 0) {
        return res.status(404).json({ message: 'Khong tim thay phieu muon hoac da tra' });
      }

      res.json({ message: 'Tra sach thanh cong' });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = BorrowController;