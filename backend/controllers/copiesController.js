// Controller CRUD bản sao sách
const fs = require('fs');
const { parse } = require('csv-parse/sync');
const CopyModel = require('../models/copyModel');
const { normalizeRowKeys } = require('../utils/csv');

const CopiesController = {
  // Lấy danh sách bản sao (server-side pagination)
  async getAll(req, res, next) {
    try {
      const page = Math.max(1, parseInt(req.query.page || '1', 10));
      const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize || '10', 10)));
      const search = (req.query.search || '').trim();
      const status = (req.query.status || '').trim();

      const { items, total } = await CopyModel.listPaged({ page, pageSize, search, status });
      res.json({ items, total, page, pageSize });
    } catch (err) {
      next(err);
    }
  },

  // Thêm bản sao
  async create(req, res, next) {
    try {
      const { book_id, status, import_date } = req.body;
      if (!book_id || !import_date) {
        return res.status(400).json({ message: 'Thieu thong tin bat buoc' });
      }

      const id = await CopyModel.create({ book_id, status, import_date });
      res.status(201).json({ message: 'Tao ban sao thanh cong', copy_id: id });
    } catch (err) {
      next(err);
    }
  },

  // Cập nhật trạng thái
  async update(req, res, next) {
    try {
      const copy_id = req.params.id;
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ message: 'Thieu trang thai' });
      }

      const affected = await CopyModel.update(copy_id, { status });
      if (affected === 0) {
        return res.status(404).json({ message: 'Khong tim thay ban sao' });
      }

      res.json({ message: 'Cap nhat trang thai thanh cong' });
    } catch (err) {
      next(err);
    }
  },

  // Xóa bản sao
  async remove(req, res, next) {
    try {
      const copy_id = req.params.id;
      const affected = await CopyModel.remove(copy_id);
      if (affected === 0) {
        return res.status(404).json({ message: 'Khong tim thay ban sao' });
      }

      res.json({ message: 'Xoa ban sao thanh cong' });
    } catch (err) {
      next(err);
    }
  },

  // Import bản sao từ CSV
  async importCsv(req, res, next) {
    let filePath = null;
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Chua co file CSV' });
      }

      filePath = req.file.path;
      const content = fs.readFileSync(filePath, 'utf8');

      // CSV header: book_id,status,import_date
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
        // Chuẩn hóa header
        const r0 = normalizeRowKeys(r);

        const book_id = r0.book_id || r0.bookid || r0.book;
        const status = r0.status || 'available';
        const import_date = r0.import_date || r0.imported_at || r0.date;

        if (!book_id || !import_date) {
          errors.push({ row, error: 'Thieu truong bat buoc' });
          continue;
        }

        if (!['available', 'borrowed', 'damaged'].includes(status)) {
          errors.push({ row, error: 'Trang thai khong hop le' });
          continue;
        }

        try {
          await CopyModel.create({ book_id, status, import_date });
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

module.exports = CopiesController;
