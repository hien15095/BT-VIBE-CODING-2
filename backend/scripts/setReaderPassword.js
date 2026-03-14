// Script tạo mật khẩu cho độc giả (reader)
// Chạy: node scripts/setReaderPassword.js DG001 123456
require('dotenv').config();
const bcrypt = require('bcryptjs');
const ReaderModel = require('../models/readerModel');

(async () => {
  try {
    const reader_id = process.argv[2];
    const password = process.argv[3];

    if (!reader_id || !password) {
      console.log('Thieu reader_id hoac password');
      process.exit(1);
    }

    const reader = await ReaderModel.findById(reader_id);
    if (!reader) {
      console.log('Khong tim thay doc gia');
      process.exit(1);
    }

    const password_hash = await bcrypt.hash(password, 10);
    await ReaderModel.updatePassword(reader_id, password_hash);

    console.log('Cap nhat mat khau doc gia thanh cong');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();