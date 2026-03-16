# Library Management System (University Edition)

Hệ thống quản lý thư viện dành cho trường đại học, có phân quyền rõ ràng, hỗ trợ mượn/trả sách, báo cáo thống kê, nhập dữ liệu bằng CSV và portal riêng cho sinh viên.

---

## 1) Tổng quan tính năng

### 1.1 Vai trò (Actors)
- **Admin**: Quản trị hệ thống, quản lý tài khoản nhân viên.
- **Librarian (Thủ thư)**: Quản lý sách, độc giả, mượn/trả.
- **Leader (Lãnh đạo)**: Xem báo cáo, thống kê.
- **Reader (Sinh viên)**: Tra cứu sách, gửi yêu cầu mượn, theo dõi tình trạng.

### 1.2 Use Case chính
- Đăng nhập (JWT) cho nhân viên và sinh viên.
- CRUD độc giả, chuyên ngành, đầu sách, bản sao.
- Mượn sách (ràng buộc: 1 độc giả chỉ mượn 1 cuốn tại một thời điểm).
- Trả sách và cập nhật tình trạng.
- Báo cáo: sách mượn nhiều nhất, độc giả chưa trả.
- Portal sinh viên: tìm kiếm, gửi yêu cầu mượn, theo dõi trạng thái, đổi mật khẩu.
- Nhập dữ liệu từ CSV (độc giả, chuyên ngành, đầu sách, bản sao, tài khoản).

---

## 2) Công nghệ sử dụng

- **Frontend**: React + Vite + TailwindCSS + Axios
- **Backend**: Node.js + Express
- **Database**: MySQL
- **Authentication**: JWT

---

## 3) Giao diện (UI) đã có

### 3.1 Hệ thống nhân viên (Admin/Librarian/Leader)
- Login
- Dashboard (KPI + biểu đồ)
- Quản lý độc giả (CRUD + tìm kiếm + phân trang server-side)
- Quản lý chuyên ngành (CRUD + tìm kiếm + phân trang)
- Quản lý đầu sách (CRUD + tìm kiếm + phân trang + lọc theo chuyên ngành)
- Quản lý bản sao (CRUD + lọc trạng thái + phân trang)
- Mượn sách (tạo phiếu + duyệt yêu cầu từ sinh viên)
- Trả sách
- Báo cáo (top sách mượn, danh sách chưa trả)
- Quản lý tài khoản nhân viên (CRUD + phân quyền)

### 3.2 Portal sinh viên
- Kho sách (tìm kiếm theo tên/tác giả/mã/chuyên ngành)
- Gửi yêu cầu mượn
- Yêu cầu của tôi (lọc trạng thái, hủy yêu cầu đang chờ)
- Lịch sử mượn
- Hồ sơ cá nhân + đổi mật khẩu
- Thống kê nhanh (tổng sách, bản sao khả dụng, sách đang mượn, yêu cầu đang chờ)

---

## 4) Database

Chạy file schema tại `database/schema.sql`. Các bảng chính:
- `users`
- `readers`
- `categories`
- `books`
- `book_copies`
- `borrow_records`
- `borrow_requests`

---

## 5) Backend (API)

### 5.1 Auth
- `POST /api/auth/login` (nhân viên)
- `POST /api/reader-auth/login` (sinh viên)

### 5.2 Readers
- `GET /api/readers`
- `POST /api/readers`
- `PUT /api/readers/:id`
- `DELETE /api/readers/:id`
- `POST /api/readers/import`

### 5.3 Categories
- `GET /api/categories`
- `POST /api/categories`
- `PUT /api/categories/:id`
- `DELETE /api/categories/:id`
- `POST /api/categories/import`

### 5.4 Books
- `GET /api/books`
- `POST /api/books`
- `PUT /api/books/:id`
- `DELETE /api/books/:id`
- `POST /api/books/import`

### 5.5 Copies
- `GET /api/copies`
- `POST /api/copies`
- `PUT /api/copies/:id`
- `DELETE /api/copies/:id`
- `POST /api/copies/import`

### 5.6 Borrow / Return
- `POST /api/borrow`
- `POST /api/return`

### 5.7 Borrow Requests (sinh viên gửi yêu cầu)
- `GET /api/borrow-requests`
- `POST /api/borrow-requests/:id/approve`
- `POST /api/borrow-requests/:id/reject`

### 5.8 Reports
- `GET /api/reports/most-borrowed`
- `GET /api/reports/unreturned`
- `GET /api/reports/summary`
- `GET /api/reports/borrow-trend`

### 5.9 Users
- `GET /api/users`
- `POST /api/users`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`
- `POST /api/users/import`

### 5.10 Portal sinh viên
- `GET /api/reader/books`
- `GET /api/reader/borrow`
- `POST /api/reader/requests`
- `GET /api/reader/requests`
- `DELETE /api/reader/requests/:id`
- `GET /api/reader/profile`
- `POST /api/reader/change-password`
- `GET /api/reader/summary`

---

## 6) CSV Import (đã có file mẫu trong `B:\VIBE_CODING_2\data`)

### 6.1 Readers
Header:
```
reader_id,full_name,class,birth_date,gender,password
```

### 6.2 Categories
Header:
```
category_name,description
```

### 6.3 Books
Header:
```
book_id,title,publisher,number_of_pages,size,author,category_id
```

### 6.4 Copies
Header:
```
book_id,status,import_date
```

### 6.5 Users
Header:
```
username,password,role
```

---

## 7) Hướng dẫn chạy dự án

### 7.1 Database
1. Mở MySQL và chạy `database/schema.sql`.
2. DB mặc định: `library_management`.

### 7.2 Backend
```bash
cd backend
npm install
```
Tạo `.env` từ `.env.example` và cấu hình DB.

Tạo tài khoản admin (tự động cập nhật nếu đã tồn tại):
```bash
npm run seed:admin -- admin 123456 admin
```

Chạy server:
```bash
npm run dev
```

### 7.3 Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 8) Tài khoản mẫu

- Admin: `admin / 123456`
- Librarian: tạo qua trang Users hoặc CSV
- Reader: tạo qua trang Readers hoặc CSV

---

## 9) Ghi chú
- Reader chỉ được mượn 1 cuốn tại một thời điểm (enforced bằng trigger).
- Nếu lỗi CSV “Thiếu trường bắt buộc”, kiểm tra header hoặc BOM.
- Nếu lỗi `borrow_requests` chưa tồn tại, cần tạo bảng trong DB.

---

## 10) Cấu trúc thư mục

```
backend/
  controllers/
  models/
  routes/
  middleware/
  config/
frontend/
  src/
    api/
    pages/
    components/
    context/
database/
  schema.sql
data/
  *.csv
```
![Demo](images/anh1 (1).png)
![Demo](images/anh1 (2).png)
![Demo](images/anh1 (3).png)
