// Controller CRUD đầu sách
const fs = require('fs');
const { parse } = require('csv-parse/sync');
const BookModel = require('../models/bookModel');
const { normalizeRowKeys } = require('../utils/csv');

const BooksController = {
  // Lấy danh sách đầu sách (server-side pagination)
  async getAll(req, res, next) {
    try {
      const page = Math.max(1, parseInt(req.query.page || '1', 10));
      const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize || '10', 10)));
      const search = (req.query.search || '').trim();
      const category_id = (req.query.category_id || '').trim();

      const { items, total } = await BookModel.listPaged({ page, pageSize, search, category_id });
      res.json({ items, total, page, pageSize });
    } catch (err) {
      next(err);
    }
  },

  // Thêm đầu sách
  async create(req, res, next) {
    try {
      const { book_id, title, publisher, number_of_pages, size, author, category_id } = req.body;

      if (!book_id || !title || !category_id) {
        return res.status(400).json({ message: 'Thieu thong tin bat buoc' });
      }

      await BookModel.create({ book_id, title, publisher, number_of_pages, size, author, category_id });
      res.status(201).json({ message: 'Tao dau sach thanh cong' });
    } catch (err) {
      next(err);
    }
  },

  // Cập nhật đầu sách
  async update(req, res, next) {
    try {
      const book_id = req.params.id;
      const { title, publisher, number_of_pages, size, author, category_id } = req.body;

      if (!title || !category_id) {
        return res.status(400).json({ message: 'Thieu thong tin bat buoc' });
      }

      const affected = await BookModel.update(book_id, { title, publisher, number_of_pages, size, author, category_id });
      if (affected === 0) {
        return res.status(404).json({ message: 'Khong tim thay dau sach' });
      }

      res.json({ message: 'Cap nhat dau sach thanh cong' });
    } catch (err) {
      next(err);
    }
  },

  // Xóa đầu sách
  async remove(req, res, next) {
    try {
      const book_id = req.params.id;
      const affected = await BookModel.remove(book_id);
      if (affected === 0) {
        return res.status(404).json({ message: 'Khong tim thay dau sach' });
      }

      res.json({ message: 'Xoa dau sach thanh cong' });
    } catch (err) {
      next(err);
    }
  },

  // Import đầu sách từ CSV
  async importCsv(req, res, next) {
    let filePath = null;
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Chua co file CSV' });
      }

      filePath = req.file.path;
      const content = fs.readFileSync(filePath, 'utf8');

      // CSV header: book_id,title,publisher,number_of_pages,size,author,category_id
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

        const book_id = r0.book_id || r0.bookid || r0.id;
        const title = r0.title || r0.book_title || r0.name;
        const publisher = r0.publisher || r0.publisher_name || null;
        const number_of_pages = r0.number_of_pages || r0.pages || r0.page_count || null;
        const size = r0.size || r0.dimension || null;
        const author = r0.author || r0.writer || null;
        const category_id = r0.category_id || r0.category || r0.categoryid;

        if (!book_id || !title || !category_id) {
          errors.push({ row, error: 'Thieu truong bat buoc' });
          continue;
        }

        try {
          await BookModel.create({
            book_id,
            title,
            publisher,
            number_of_pages,
            size,
            author,
            category_id
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

module.exports = BooksController;
