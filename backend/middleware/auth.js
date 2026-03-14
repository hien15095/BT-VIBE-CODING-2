// Middleware kiểm tra JWT và phân quyền
const jwt = require('jsonwebtoken');

// allowedRoles: mảng role được phép truy cập
// Hỗ trợ thêm role reader cho sinh viên
const auth = (allowedRoles = []) => (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: 'Chua dang nhap' });
    }

    // Giải mã JWT để lấy thông tin user
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;

    // Nếu có yêu cầu role, kiểm tra quyền
    if (allowedRoles.length > 0 && !allowedRoles.includes(payload.role)) {
      return res.status(403).json({ message: 'Khong du quyen truy cap' });
    }

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token khong hop le' });
  }
};

module.exports = auth;
