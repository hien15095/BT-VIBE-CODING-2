// Helpers xử lý CSV import
const normalizeKey = (key) => {
  // Xóa BOM nếu có, chuẩn hóa khoảng trắng và chữ thường
  return String(key || '')
    .replace(/^\uFEFF/, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');
};

const normalizeRowKeys = (row) => {
  const out = {};
  for (const [k, v] of Object.entries(row || {})) {
    out[normalizeKey(k)] = v;
  }
  return out;
};

module.exports = {
  normalizeRowKeys
};
