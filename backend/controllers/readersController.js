// Controller CRUD độc giả
const bcrypt = require('bcryptjs');
const fs = require('fs');
const { parse } = require('csv-parse/sync');
const ReaderModel = require('../models/readerModel');
const { normalizeRowKeys } = require('../utils/csv');

const ReadersController = {
  // Chuẩn hóa giới tính để tránh lỗi ENUM
  normalizeGender(input) {
    if (!input) return null;
    const v = String(input).trim().toLowerCase();
    if (v === 'nam') return 'Nam';
    if (v === 'nữ' || v === 'nu') return 'Nữ';
    if (v === 'khác' || v === 'khac') return 'Khác';
    return null;
  },

  // Lấy danh sách độc giả (server-side pagination)
  async getAll(req, res, next) {
    try {
      const page = Math.max(1, parseInt(req.query.page || '1', 10));
      const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize || '10', 10)));
      const search = (req.query.search || '').trim();
      const gender = (req.query.gender || '').trim();

      const { items, total } = await ReaderModel.listPaged({ page, pageSize, search, gender });
      res.json({ items, total, page, pageSize });
    } catch (err) {
      next(err);
    }
  },

  // Thêm độc giả
  async create(req, res, next) {
    try {
      const { reader_id, full_name, class: className, birth_date, gender, password } = req.body;
      if (!reader_id || !full_name || !className || !birth_date || !gender) {
        return res.status(400).json({ message: 'Thieu thong tin bat buoc' });
      }

      const normalizedGender = ReadersController.normalizeGender(gender);
      if (!normalizedGender) {
        return res.status(400).json({ message: 'Gioi tinh khong hop le' });
      }

      // Nếu có password thì hash để lưu
      let password_hash = null;
      if (password && String(password).trim() !== '') {
        password_hash = await bcrypt.hash(password, 10);
      }

      await ReaderModel.create({
        reader_id,
        full_name,
        class: className,
        birth_date,
        gender: normalizedGender,
        password_hash
      });
      res.status(201).json({ message: 'Tao doc gia thanh cong' });
    } catch (err) {
      next(err);
    }
  },

  // Cập nhật độc giả
  async update(req, res, next) {
    try {
      const reader_id = req.params.id;
      const { full_name, class: className, birth_date, gender, password } = req.body;

      if (!full_name || !className || !birth_date || !gender) {
        return res.status(400).json({ message: 'Thieu thong tin bat buoc' });
      }

      const normalizedGender = ReadersController.normalizeGender(gender);
      if (!normalizedGender) {
        return res.status(400).json({ message: 'Gioi tinh khong hop le' });
      }

      const affected = await ReaderModel.update(reader_id, {
        full_name,
        class: className,
        birth_date,
        gender: normalizedGender
      });
      if (affected === 0) {
        return res.status(404).json({ message: 'Khong tim thay doc gia' });
      }

      // Nếu có password mới thì cập nhật
      if (password && String(password).trim() !== '') {
        const password_hash = await bcrypt.hash(password, 10);
        await ReaderModel.updatePassword(reader_id, password_hash);
      }

      res.json({ message: 'Cap nhat doc gia thanh cong' });
    } catch (err) {
      next(err);
    }
  },

  // Xóa độc giả
  async remove(req, res, next) {
    try {
      const reader_id = req.params.id;
      const affected = await ReaderModel.remove(reader_id);
      if (affected === 0) {
        return res.status(404).json({ message: 'Khong tim thay doc gia' });
      }

      res.json({ message: 'Xoa doc gia thanh cong' });
    } catch (err) {
      next(err);
    }
  },

  // Import độc giả từ file CSV
  async importCsv(req, res, next) {
    let filePath = null;
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Chua co file CSV' });
      }

      filePath = req.file.path;
      const content = fs.readFileSync(filePath, 'utf8');

      // CSV phải có header: reader_id,full_name,class,birth_date,gender,password
      const records = parse(content, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        bom: true
      });

      let inserted = 0;
      const errors = [];

      for (const [index, r] of records.entries()) {
        const row = index + 1;
        // Chuẩn hóa header (không phân biệt hoa/thường, có/không dấu cách, có BOM)
        const r0 = normalizeRowKeys(r);

        const reader_id = r0.reader_id || r0.readerid || r0.id;
        const full_name = r0.full_name || r0.fullname || r0.name;
        const className = r0.class || r0.class_name || r0.classname;
        const birth_date = r0.birth_date || r0.birthdate || r0.dob;
        const gender = r0.gender || r0.sex;
        const password = r0.password || r0.pass;

        if (!reader_id || !full_name || !className || !birth_date || !gender) {
          errors.push({ row, error: 'Thieu truong bat buoc' });
          continue;
        }

        const normalizedGender = ReadersController.normalizeGender(gender);
        if (!normalizedGender) {
          errors.push({ row, error: 'Gioi tinh khong hop le' });
          continue;
        }

        let password_hash = null;
        if (password && String(password).trim() !== '') {
          password_hash = await bcrypt.hash(password, 10);
        }

        try {
          await ReaderModel.create({
            reader_id,
            full_name,
            class: className,
            birth_date,
            gender: normalizedGender,
            password_hash
          });
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

module.exports = ReadersController;
