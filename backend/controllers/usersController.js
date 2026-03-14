// Controller quản lý tài khoản nhân viên
const bcrypt = require('bcryptjs');
const fs = require('fs');
const { parse } = require('csv-parse/sync');
const UserModel = require('../models/userModel');
const { normalizeRowKeys } = require('../utils/csv');

const UsersController = {
  // Lấy danh sách user (server-side pagination)
  async getAll(req, res, next) {
    try {
      const page = Math.max(1, parseInt(req.query.page || '1', 10));
      const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize || '10', 10)));
      const search = (req.query.search || '').trim();
      const role = (req.query.role || '').trim();

      const { items, total } = await UserModel.listPaged({ page, pageSize, search, role });
      res.json({ items, total, page, pageSize });
    } catch (err) {
      next(err);
    }
  },

  // Tạo user mới
  async create(req, res, next) {
    try {
      const { username, password, role } = req.body;
      const allowedRoles = ['admin', 'librarian', 'leader'];

      if (!username || !password || !role) {
        return res.status(400).json({ message: 'Thieu thong tin bat buoc' });
      }

      if (!allowedRoles.includes(role)) {
        return res.status(400).json({ message: 'Role khong hop le' });
      }

      // Hash mật khẩu trước khi lưu
      const password_hash = await bcrypt.hash(password, 10);
      const user_id = await UserModel.create({ username, password_hash, role });

      res.status(201).json({ message: 'Tao user thanh cong', user_id });
    } catch (err) {
      next(err);
    }
  },

  // Cập nhật user
  async update(req, res, next) {
    try {
      const user_id = req.params.id;
      const { username, password, role } = req.body;
      const allowedRoles = ['admin', 'librarian', 'leader'];

      if (!username || !role) {
        return res.status(400).json({ message: 'Thieu thong tin bat buoc' });
      }

      if (!allowedRoles.includes(role)) {
        return res.status(400).json({ message: 'Role khong hop le' });
      }

      // Nếu không nhập password mới, giữ nguyên mật khẩu cũ
      let password_hash = null;
      if (password) {
        password_hash = await bcrypt.hash(password, 10);
      } else {
        // Lấy user hiện tại theo id để giữ password_hash
        const current = await UserModel.findById(user_id);
        if (!current) {
          return res.status(404).json({ message: 'Khong tim thay user' });
        }
        password_hash = current.password_hash;
      }

      const affected = await UserModel.update(user_id, { username, password_hash, role });
      if (affected === 0) {
        return res.status(404).json({ message: 'Khong tim thay user' });
      }

      res.json({ message: 'Cap nhat user thanh cong' });
    } catch (err) {
      next(err);
    }
  },

  // Xóa user
  async remove(req, res, next) {
    try {
      const user_id = req.params.id;
      const affected = await UserModel.remove(user_id);
      if (affected === 0) {
        return res.status(404).json({ message: 'Khong tim thay user' });
      }

      res.json({ message: 'Xoa user thanh cong' });
    } catch (err) {
      next(err);
    }
  },

  // Import user từ CSV
  async importCsv(req, res, next) {
    let filePath = null;
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Chua co file CSV' });
      }

      filePath = req.file.path;
      const content = fs.readFileSync(filePath, 'utf8');

      // CSV header: username,password,role
      const records = parse(content, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        bom: true
      });

      let inserted = 0;
      const errors = [];
      const allowedRoles = ['admin', 'librarian', 'leader'];

      for (const [index, r] of records.entries()) {
        const row = index + 1;
        // Chuẩn hóa header
        const r0 = normalizeRowKeys(r);

        const username = r0.username || r0.user || r0.login;
        const password = r0.password || r0.pass;
        const role = r0.role || r0.user_role;

        if (!username || !password || !role) {
          errors.push({ row, error: 'Thieu truong bat buoc' });
          continue;
        }

        if (!allowedRoles.includes(role)) {
          errors.push({ row, error: 'Role khong hop le' });
          continue;
        }

        try {
          const password_hash = await bcrypt.hash(password, 10);
          await UserModel.create({ username, password_hash, role });
          inserted += 1;
        } catch (err) {
          errors.push({ row, error: err.message });
        }
      }

      res.json({ inserted, failed: errors.length, errors });
    } catch (err) {
      next(err);
    } finally {
      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  }
};

module.exports = UsersController;
