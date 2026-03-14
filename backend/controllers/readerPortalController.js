// Controller dành cho sinh viên
const bcrypt = require('bcryptjs');
const ReaderPortalModel = require('../models/readerPortalModel');
const BorrowRequestModel = require('../models/borrowRequestModel');
const ReaderModel = require('../models/readerModel');

const ReaderPortalController = {
  // Xem danh sách đầu sách
  async listBooks(req, res, next) {
    try {
      const search = req.query.search || '';
      const category_id = req.query.category_id || '';
      const rows = await ReaderPortalModel.listBooks(search, category_id);
      res.json(rows);
    } catch (err) {
      next(err);
    }
  },

  // Xem trạng thái mượn của chính mình
  async myBorrow(req, res, next) {
    try {
      const reader_id = req.user.user_id;
      const rows = await ReaderPortalModel.myBorrow(reader_id);
      res.json(rows);
    } catch (err) {
      next(err);
    }
  },

  // Sinh viên gửi yêu cầu mượn sách theo book_id
  async requestBorrow(req, res, next) {
    try {
      const reader_id = req.user.user_id;
      const { book_id } = req.body;

      if (!book_id) {
        return res.status(400).json({ message: 'Thiếu book_id' });
      }

      // Không cho tạo yêu cầu nếu đã có sách đang mượn hoặc đang pending
      const hasActive = await BorrowRequestModel.hasActiveBorrowOrPending(reader_id);
      if (hasActive) {
        return res.status(400).json({ message: 'Bạn đang có sách đang mượn hoặc yêu cầu đang chờ' });
      }

      // Kiểm tra còn bản sao available
      const available = await ReaderPortalModel.countAvailableCopies(book_id);
      if (available === 0) {
        return res.status(400).json({ message: 'Sách hiện không còn bản sao khả dụng' });
      }

      const request_id = await BorrowRequestModel.create({ reader_id, book_id });
      res.status(201).json({ message: 'Gửi yêu cầu mượn thành công', request_id });
    } catch (err) {
      next(err);
    }
  },

  // Danh sách yêu cầu mượn của sinh viên
  async myRequests(req, res, next) {
    try {
      const reader_id = req.user.user_id;
      const page = Math.max(1, parseInt(req.query.page || '1', 10));
      const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize || '10', 10)));
      const status = (req.query.status || '').trim();

      const { items, total } = await BorrowRequestModel.listByReaderPaged({
        reader_id,
        page,
        pageSize,
        status
      });

      res.json({ items, total, page, pageSize });
    } catch (err) {
      next(err);
    }
  },

  // Hủy yêu cầu mượn (pending)
  async cancelRequest(req, res, next) {
    try {
      const reader_id = req.user.user_id;
      const request_id = req.params.id;

      const affected = await BorrowRequestModel.cancelByReader(request_id, reader_id);
      if (affected === 0) {
        return res.status(400).json({ message: 'Chỉ có thể hủy yêu cầu đang chờ của chính mình' });
      }

      res.json({ message: 'Đã hủy yêu cầu' });
    } catch (err) {
      next(err);
    }
  },

  // Thông tin hồ sơ sinh viên
  async profile(req, res, next) {
    try {
      const reader_id = req.user.user_id;
      const reader = await ReaderModel.findById(reader_id);
      if (!reader) {
        return res.status(404).json({ message: 'Không tìm thấy sinh viên' });
      }
      res.json(reader);
    } catch (err) {
      next(err);
    }
  },

  // Đổi mật khẩu sinh viên
  async changePassword(req, res, next) {
    try {
      const reader_id = req.user.user_id;
      const { old_password, new_password } = req.body;

      if (!old_password || !new_password) {
        return res.status(400).json({ message: 'Thiếu mật khẩu cũ hoặc mới' });
      }

      const reader = await ReaderModel.findByIdWithPassword(reader_id);
      if (!reader || !reader.password_hash) {
        return res.status(400).json({ message: 'Tài khoản chưa có mật khẩu' });
      }

      const ok = await bcrypt.compare(old_password, reader.password_hash);
      if (!ok) {
        return res.status(400).json({ message: 'Mật khẩu cũ không đúng' });
      }

      const password_hash = await bcrypt.hash(new_password, 10);
      await ReaderModel.updatePassword(reader_id, password_hash);

      res.json({ message: 'Đổi mật khẩu thành công' });
    } catch (err) {
      next(err);
    }
  },

  // Tóm tắt thông tin sinh viên (dashboard nhỏ)
  async summary(req, res, next) {
    try {
      const reader_id = req.user.user_id;
      const [books, available, borrowed, pending] = await Promise.all([
        ReaderPortalModel.countBooks(),
        ReaderPortalModel.countAvailableAll(),
        ReaderPortalModel.countBorrowedByReader(reader_id),
        ReaderPortalModel.countPendingRequests(reader_id)
      ]);

      res.json({ books, available, borrowed, pending });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = ReaderPortalController;
