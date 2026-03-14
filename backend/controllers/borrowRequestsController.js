// Controller xử lý yêu cầu mượn sách
const pool = require('../config/db');
const BorrowRequestModel = require('../models/borrowRequestModel');

const BorrowRequestsController = {
  // Danh sách yêu cầu (server-side pagination)
  async getAll(req, res, next) {
    try {
      const page = Math.max(1, parseInt(req.query.page || '1', 10));
      const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize || '10', 10)));
      const search = (req.query.search || '').trim();
      const status = (req.query.status || '').trim();

      const { items, total } = await BorrowRequestModel.listPaged({
        page,
        pageSize,
        search,
        status
      });
      res.json({ items, total, page, pageSize });
    } catch (err) {
      next(err);
    }
  },

  // Duyệt yêu cầu -> tạo phiếu mượn thật
  async approve(req, res, next) {
    let conn;
    try {
      const request_id = req.params.id;
      const librarian_id = req.user.user_id;

      const request = await BorrowRequestModel.findById(request_id);
      if (!request) {
        return res.status(404).json({ message: 'Khong tim thay yeu cau' });
      }

      if (request.status !== 'pending') {
        return res.status(400).json({ message: 'Yeu cau da duoc xu ly' });
      }

      conn = await pool.getConnection();
      await conn.beginTransaction();

      // Tìm 1 bản sao còn available của book_id
      const [[copyRow]] = await conn.query(
        'SELECT copy_id FROM book_copies WHERE book_id = ? AND status = ? LIMIT 1',
        [request.book_id, 'available']
      );

      if (!copyRow) {
        await conn.rollback();
        return res.status(400).json({ message: 'Khong con ban sao available' });
      }

      // Tạo phiếu mượn (trigger sẽ tự cập nhật status bản sao)
      await conn.query(
        'INSERT INTO borrow_records (copy_id, reader_id, librarian_id) VALUES (?, ?, ?)',
        [copyRow.copy_id, request.reader_id, librarian_id]
      );

      // Cập nhật trạng thái yêu cầu
      await conn.query(
        `UPDATE borrow_requests
         SET status = 'approved', processed_by = ?, processed_at = NOW()
         WHERE request_id = ?`,
        [librarian_id, request_id]
      );

      await conn.commit();
      res.json({ message: 'Duyet yeu cau thanh cong' });
    } catch (err) {
      if (conn) {
        await conn.rollback();
      }
      next(err);
    } finally {
      if (conn) conn.release();
    }
  },

  // Từ chối yêu cầu
  async reject(req, res, next) {
    try {
      const request_id = req.params.id;
      const librarian_id = req.user.user_id;
      const note = (req.body?.note || '').trim();

      const request = await BorrowRequestModel.findById(request_id);
      if (!request) {
        return res.status(404).json({ message: 'Khong tim thay yeu cau' });
      }

      if (request.status !== 'pending') {
        return res.status(400).json({ message: 'Yeu cau da duoc xu ly' });
      }

      await BorrowRequestModel.updateStatus(request_id, {
        status: 'rejected',
        processed_by: librarian_id,
        note
      });

      res.json({ message: 'Da tu choi yeu cau' });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = BorrowRequestsController;
