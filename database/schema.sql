# =============================================================
# Library Management System - MySQL Schema
# Encoding: UTF-8 (utf8mb4)
# Mục tiêu: Thiết kế CSDL cho hệ thống quản lý thư viện đại học
# =============================================================

# Tạo database và chọn charset chuẩn để lưu tiếng Việt
CREATE DATABASE IF NOT EXISTS library_management
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE library_management;

# -----------------------------
# Bảng users: tài khoản nhân viên thư viện
# role: admin | librarian | leader
# -----------------------------
CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','librarian','leader') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

# -----------------------------
# Bảng readers: thông tin độc giả (sinh viên)
# reader_id dùng định dạng như DG001
# -----------------------------
CREATE TABLE IF NOT EXISTS readers (
  reader_id VARCHAR(20) PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  class VARCHAR(50) NOT NULL,
  birth_date DATE NOT NULL,
  # Dùng VARCHAR để tránh lỗi enum khi nhập CSV
  gender VARCHAR(10) NOT NULL,
  # Mật khẩu hash để đăng nhập cho sinh viên (reader)
  password_hash VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_readers_name (full_name)
) ENGINE=InnoDB;

# -----------------------------
# Bảng categories: chuyên ngành sách
# -----------------------------
CREATE TABLE IF NOT EXISTS categories (
  category_id INT AUTO_INCREMENT PRIMARY KEY,
  category_name VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(255) NULL
) ENGINE=InnoDB;

# -----------------------------
# Bảng books: đầu sách
# book_id có thể là mã như B001
# -----------------------------
CREATE TABLE IF NOT EXISTS books (
  book_id VARCHAR(20) PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  publisher VARCHAR(150) NULL,
  number_of_pages INT NULL,
  size VARCHAR(50) NULL,
  author VARCHAR(150) NULL,
  category_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_books_title (title),
  INDEX idx_books_author (author),
  CONSTRAINT fk_books_category
    FOREIGN KEY (category_id) REFERENCES categories(category_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB;

# -----------------------------
# Bảng book_copies: bản sao sách
# status: available | borrowed | damaged
# -----------------------------
CREATE TABLE IF NOT EXISTS book_copies (
  copy_id INT AUTO_INCREMENT PRIMARY KEY,
  book_id VARCHAR(20) NOT NULL,
  status ENUM('available','borrowed','damaged') NOT NULL DEFAULT 'available',
  import_date DATE NOT NULL,
  INDEX idx_copies_status (status),
  CONSTRAINT fk_copies_book
    FOREIGN KEY (book_id) REFERENCES books(book_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB;

# -----------------------------
# Bảng borrow_records: phiếu mượn trả
# status: borrowed | returned
# Mỗi độc giả chỉ được mượn 1 cuốn tại một thời điểm (enforce bằng trigger)
# -----------------------------
CREATE TABLE IF NOT EXISTS borrow_records (
  borrow_id INT AUTO_INCREMENT PRIMARY KEY,
  copy_id INT NOT NULL,
  reader_id VARCHAR(20) NOT NULL,
  librarian_id INT NOT NULL,
  borrow_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  return_date DATETIME NULL,
  status ENUM('borrowed','returned') NOT NULL DEFAULT 'borrowed',
  book_condition ENUM('good','damaged','lost') NULL,
  INDEX idx_borrow_status (status),
  INDEX idx_borrow_reader (reader_id),
  CONSTRAINT fk_borrow_copy
    FOREIGN KEY (copy_id) REFERENCES book_copies(copy_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_borrow_reader
    FOREIGN KEY (reader_id) REFERENCES readers(reader_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_borrow_librarian
    FOREIGN KEY (librarian_id) REFERENCES users(user_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB;

# -----------------------------
# Bảng borrow_requests: yêu cầu mượn sách của sinh viên
# status: pending | approved | rejected
# -----------------------------
CREATE TABLE IF NOT EXISTS borrow_requests (
  request_id INT AUTO_INCREMENT PRIMARY KEY,
  reader_id VARCHAR(20) NOT NULL,
  book_id VARCHAR(20) NOT NULL,
  status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  request_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  processed_by INT NULL,
  processed_at DATETIME NULL,
  note VARCHAR(255) NULL,
  INDEX idx_req_status (status),
  INDEX idx_req_reader (reader_id),
  INDEX idx_req_book (book_id),
  CONSTRAINT fk_req_reader
    FOREIGN KEY (reader_id) REFERENCES readers(reader_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_req_book
    FOREIGN KEY (book_id) REFERENCES books(book_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_req_user
    FOREIGN KEY (processed_by) REFERENCES users(user_id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB;

# =============================================================
# TRIGGERS: đảm bảo quy tắc nghiệp vụ
# =============================================================

# Trigger: Chỉ cho mượn khi bản sao đang available
# và độc giả chưa có sách đang mượn
DELIMITER $$
CREATE TRIGGER trg_borrow_before_insert
BEFORE INSERT ON borrow_records
FOR EACH ROW
BEGIN
  # Kiểm tra bản sao sách có sẵn
  IF (SELECT status FROM book_copies WHERE copy_id = NEW.copy_id) <> 'available' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Ban sao sach khong co san';
  END IF;

  # Kiểm tra độc giả chưa có sách đang mượn
  IF EXISTS (
    SELECT 1 FROM borrow_records
    WHERE reader_id = NEW.reader_id AND status = 'borrowed'
  ) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Doc gia da muon 1 cuon sach';
  END IF;
END$$
DELIMITER ;

# Trigger: Sau khi tạo phiếu mượn -> cập nhật trạng thái bản sao thành borrowed
DELIMITER $$
CREATE TRIGGER trg_borrow_after_insert
AFTER INSERT ON borrow_records
FOR EACH ROW
BEGIN
  UPDATE book_copies
  SET status = 'borrowed'
  WHERE copy_id = NEW.copy_id;
END$$
DELIMITER ;

# Trigger: Khi trả sách -> cập nhật trạng thái bản sao thành available
DELIMITER $$
CREATE TRIGGER trg_borrow_after_update
AFTER UPDATE ON borrow_records
FOR EACH ROW
BEGIN
  IF NEW.status = 'returned' AND OLD.status = 'borrowed' THEN
    UPDATE book_copies
    SET status = 'available'
    WHERE copy_id = NEW.copy_id;
  END IF;
END$$
DELIMITER ;
