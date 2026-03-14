// Middleware upload file CSV
const path = require('path');
const multer = require('multer');

// Lưu file tạm trong thư mục uploads/
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const safeName = `${Date.now()}-${file.originalname}`;
    cb(null, safeName);
  }
});

// Chỉ cho phép file .csv
const fileFilter = (req, file, cb) => {
  if (file.mimetype.includes('csv') || file.originalname.toLowerCase().endsWith('.csv')) {
    cb(null, true);
  } else {
    cb(new Error('Chi chap nhan file CSV'));
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;