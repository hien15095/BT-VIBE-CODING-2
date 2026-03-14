// Controller CRUD chuyên ngành sách
const fs = require('fs');
const { parse } = require('csv-parse/sync');
const CategoryModel = require('../models/categoryModel');
const { normalizeRowKeys } = require('../utils/csv');

const CategoriesController = {
  // Lấy danh sách chuyên ngành (server-side pagination)
  async getAll(req, res, next) {
    try {
      const all = req.query.all === '1';
      const search = (req.query.search || '').trim();

      if (all) {
        const rows = await CategoryModel.list();
        return res.json(rows);
      }

      const page = Math.max(1, parseInt(req.query.page || '1', 10));
      const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize || '10', 10)));

      const { items, total } = await CategoryModel.listPaged({ page, pageSize, search });
      res.json({ items, total, page, pageSize });
    } catch (err) {
      next(err);
    }
  },

  // Thêm chuyên ngành
  async create(req, res, next) {
    try {
      const { category_name, description } = req.body;
      if (!category_name) {
        return res.status(400).json({ message: 'Thieu ten chuyen nganh' });
      }

      const id = await CategoryModel.create({ category_name, description });
      res.status(201).json({ message: 'Tao chuyen nganh thanh cong', category_id: id });
    } catch (err) {
      next(err);
    }
  },

  // Cập nhật chuyên ngành
  async update(req, res, next) {
    try {
      const category_id = req.params.id;
      const { category_name, description } = req.body;
      if (!category_name) {
        return res.status(400).json({ message: 'Thieu ten chuyen nganh' });
      }

      const affected = await CategoryModel.update(category_id, { category_name, description });
      if (affected === 0) {
        return res.status(404).json({ message: 'Khong tim thay chuyen nganh' });
      }

      res.json({ message: 'Cap nhat chuyen nganh thanh cong' });
    } catch (err) {
      next(err);
    }
  },

  // Xóa chuyên ngành
  async remove(req, res, next) {
    try {
      const category_id = req.params.id;
      const affected = await CategoryModel.remove(category_id);
      if (affected === 0) {
        return res.status(404).json({ message: 'Khong tim thay chuyen nganh' });
      }

      res.json({ message: 'Xoa chuyen nganh thanh cong' });
    } catch (err) {
      next(err);
    }
  },

  // Import chuyên ngành từ CSV
  async importCsv(req, res, next) {
    let filePath = null;
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Chua co file CSV' });
      }

      filePath = req.file.path;
      const content = fs.readFileSync(filePath, 'utf8');

      // CSV header: category_name,description
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

        const category_name = r0.category_name || r0.category || r0.name;
        const description = r0.description || r0.desc || null;

        if (!category_name) {
          errors.push({ row, error: 'Thieu category_name' });
          continue;
        }

        try {
          await CategoryModel.create({ category_name, description });
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

module.exports = CategoriesController;
