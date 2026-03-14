// Controller đăng nhập cho sinh viên (reader)
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ReaderModel = require('../models/readerModel');

const ReaderAuthController = {
  // Đăng nhập bằng reader_id + password
  async login(req, res, next) {
    try {
      const { reader_id, password } = req.body;

      if (!reader_id || !password) {
        return res.status(400).json({ message: 'Thieu reader_id hoac password' });
      }

      const reader = await ReaderModel.findByIdWithPassword(reader_id);
      if (!reader || !reader.password_hash) {
        return res.status(401).json({ message: 'Sai thong tin dang nhap' });
      }

      const ok = await bcrypt.compare(password, reader.password_hash);
      if (!ok) {
        return res.status(401).json({ message: 'Sai thong tin dang nhap' });
      }

      const token = jwt.sign(
        {
          user_id: reader.reader_id,
          username: reader.full_name,
          role: 'reader'
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '2h' }
      );

      res.json({
        token,
        user: {
          user_id: reader.reader_id,
          username: reader.full_name,
          role: 'reader',
          class: reader.class
        }
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = ReaderAuthController;