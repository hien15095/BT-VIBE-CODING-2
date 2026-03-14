// Controller xử lý đăng nhập
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');

const AuthController = {
  // Đăng nhập bằng username/password
  async login(req, res, next) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: 'Thieu username hoac password' });
      }

      const user = await UserModel.findByUsername(username);
      if (!user) {
        return res.status(401).json({ message: 'Sai thong tin dang nhap' });
      }

      // So sánh mật khẩu đã hash
      const ok = await bcrypt.compare(password, user.password_hash);
      if (!ok) {
        return res.status(401).json({ message: 'Sai thong tin dang nhap' });
      }

      // Tạo JWT chứa thông tin cần thiết
      const token = jwt.sign(
        {
          user_id: user.user_id,
          username: user.username,
          role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '2h' }
      );

      res.json({
        token,
        user: {
          user_id: user.user_id,
          username: user.username,
          role: user.role
        }
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = AuthController;