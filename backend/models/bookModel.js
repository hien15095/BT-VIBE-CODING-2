// Model thao tác bảng books
const pool = require('../config/db');

const BookModel = {
  // Lấy danh sách đầu sách, có hỗ trợ tìm kiếm theo tiêu đề/author
  async list(search = '') {
    if (search) {
      const [rows] = await pool.query(
        `SELECT * FROM books
         WHERE title LIKE ? OR author LIKE ?
         ORDER BY book_id DESC`,
        [`%${search}%`, `%${search}%`]
      );
      return rows;
    }

    const [rows] = await pool.query('SELECT * FROM books ORDER BY book_id DESC');
    return rows;
  },

  // Danh sách có phân trang + lọc
  async listPaged({ page, pageSize, search, category_id }) {
    const where = [];
    const params = [];

    if (search) {
      where.push('(b.book_id LIKE ? OR b.title LIKE ? OR b.author LIKE ? OR b.publisher LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (category_id) {
      where.push('b.category_id = ?');
      params.push(category_id);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [[countRow]] = await pool.query(
      `SELECT COUNT(*) AS total FROM books b ${whereSql}`,
      params
    );

    const offset = (page - 1) * pageSize;
    const [rows] = await pool.query(
      `SELECT b.*, c.category_name
       FROM books b
       LEFT JOIN categories c ON c.category_id = b.category_id
       ${whereSql}
       ORDER BY b.book_id DESC
       LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    return { items: rows, total: countRow.total };
  },

  // Thêm đầu sách
  async create(data) {
    const { book_id, title, publisher, number_of_pages, size, author, category_id } = data;
    const [result] = await pool.query(
      `INSERT INTO books (book_id, title, publisher, number_of_pages, size, author, category_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [book_id, title, publisher || null, number_of_pages || null, size || null, author || null, category_id]
    );
    return result.affectedRows;
  },

  // Cập nhật đầu sách
  async update(book_id, data) {
    const { title, publisher, number_of_pages, size, author, category_id } = data;
    const [result] = await pool.query(
      `UPDATE books
       SET title = ?, publisher = ?, number_of_pages = ?, size = ?, author = ?, category_id = ?
       WHERE book_id = ?`,
      [title, publisher || null, number_of_pages || null, size || null, author || null, category_id, book_id]
    );
    return result.affectedRows;
  },

  // Xóa đầu sách
  async remove(book_id) {
    const [result] = await pool.query('DELETE FROM books WHERE book_id = ?', [book_id]);
    return result.affectedRows;
  }
};

module.exports = BookModel;