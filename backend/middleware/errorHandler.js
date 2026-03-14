// Middleware xử lý lỗi tập trung
module.exports = (err, req, res, next) => {
  console.error(err);

  // Nếu đã có status trong error thì dùng, ngược lại 500
  const status = err.status || 500;
  const message = err.message || 'Loi he thong';

  res.status(status).json({ message });
};