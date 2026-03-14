# API Examples (cURL)

## 1) Đăng nhập
```bash
# Thay username/password theo dữ liệu của bạn
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456"}'
```

## 1b) Đăng nhập sinh viên
```bash
curl -X POST http://localhost:4000/api/reader-auth/login \
  -H "Content-Type: application/json" \
  -d '{"reader_id":"DG001","password":"123456"}'
```

## 2) Lấy danh sách độc giả
```bash
# Token lấy từ API login
curl -X GET "http://localhost:4000/api/readers" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

## 3) Thêm độc giả
```bash
curl -X POST http://localhost:4000/api/readers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{"reader_id":"DG001","full_name":"Nguyen Van A","class":"CNTT1","birth_date":"2004-05-10","gender":"Nam","password":"123456"}'
```

## 3b) Import độc giả từ CSV
```bash
curl -X POST http://localhost:4000/api/readers/import \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -F "file=@readers.csv"
```

## 4) Import chuyên ngành từ CSV
```bash
curl -X POST http://localhost:4000/api/categories/import \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -F "file=@categories.csv"
```

## 5) Thêm đầu sách
```bash
curl -X POST http://localhost:4000/api/books \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{"book_id":"B001","title":"Lap trinh Web","author":"Nguyen B","category_id":1}'
```

## 5b) Import đầu sách từ CSV
```bash
curl -X POST http://localhost:4000/api/books/import \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -F "file=@books.csv"
```

## 6) Thêm bản sao
```bash
curl -X POST http://localhost:4000/api/copies \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{"book_id":"B001","status":"available","import_date":"2026-03-01"}'
```

## 6b) Import bản sao từ CSV
```bash
curl -X POST http://localhost:4000/api/copies/import \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -F "file=@copies.csv"
```

## 7) Import users from CSV
```bash
curl -X POST http://localhost:4000/api/users/import \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -F "file=@users.csv"
```

## 8) Mượn sách
```bash
curl -X POST http://localhost:4000/api/borrow \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{"copy_id":1,"reader_id":"DG001"}'
```

## 9) Trả sách
```bash
curl -X POST http://localhost:4000/api/return \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{"borrow_id":1,"book_condition":"good"}'
```

## 10) Báo cáo sách mượn nhiều
```bash
curl -X GET "http://localhost:4000/api/reports/most-borrowed?limit=10" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

## 11) Báo cáo độc giả chưa trả
```bash
curl -X GET "http://localhost:4000/api/reports/unreturned" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```