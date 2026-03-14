// Trang quản lý độc giả
import { useState } from 'react';
import CrudPage from '../components/CrudPage.jsx';
import readersApi from '../api/readers.js';

const ReadersPage = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Upload CSV để tạo hàng loạt độc giả
  const handleImport = async () => {
    try {
      if (!file) {
        setMessage('Vui long chon file CSV');
        return;
      }

      const res = await readersApi.importCsv(file);
      setMessage(`Da import: ${res.data.inserted}, Loi: ${res.data.failed}`);
      setErrors(res.data.errors || []);
      setFile(null);

      // Tải lại danh sách sau khi import
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Import that bai');
      setErrors(err.response?.data?.errors || []);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-4 border border-slate-200">
        <div className="text-lg font-semibold mb-3">Import độc giả từ CSV</div>
        <div className="text-sm text-slate-500 mb-2">
          CSV header: reader_id, full_name, class, birth_date, gender, password
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full md:w-auto"
          />
          <button
            onClick={handleImport}
            className="px-4 py-2 rounded-lg bg-brand-600 text-white"
          >
            Upload CSV
          </button>
        </div>

        {message && <div className="text-sm text-brand-700 mt-2">{message}</div>}

        {errors.length > 0 && (
          <div className="mt-3 text-sm text-red-600">
            <div className="font-medium mb-1">Lỗi chi tiết:</div>
            <ul className="list-disc pl-5 space-y-1">
              {errors.slice(0, 20).map((e, idx) => (
                <li key={idx}>Dòng {e.row}: {e.error}</li>
              ))}
              {errors.length > 20 && <li>... còn {errors.length - 20} lỗi</li>}
            </ul>
          </div>
        )}
      </div>

      <CrudPage
        key={refreshKey}
        title="Quản lý độc giả"
        idField="reader_id"
        searchable
        filters={[
          {
            name: 'gender',
            label: 'Giới tính',
            options: [
              { value: 'Nam', label: 'Nam' },
              { value: 'Nữ', label: 'Nữ' },
              { value: 'Khác', label: 'Khác' }
            ]
          }
        ]}
        columns={[
          { key: 'reader_id', label: 'Mã độc giả' },
          { key: 'full_name', label: 'Họ tên' },
          { key: 'class', label: 'Lớp' },
          { key: 'birth_date', label: 'Ngày sinh' },
          { key: 'gender', label: 'Giới tính' }
        ]}
        formFields={[
          { name: 'reader_id', label: 'Mã độc giả', required: true, lockedOnEdit: true },
          { name: 'full_name', label: 'Họ tên', required: true },
          { name: 'class', label: 'Lớp', required: true },
          { name: 'birth_date', label: 'Ngày sinh', type: 'date', required: true },
          {
            name: 'gender',
            label: 'Giới tính',
            type: 'select',
            required: true,
            options: [
              { value: 'Nam', label: 'Nam' },
              { value: 'Nữ', label: 'Nữ' },
              { value: 'Khác', label: 'Khác' }
            ]
          },
          { name: 'password', label: 'Mật khẩu (tuỳ chọn)', type: 'password' }
        ]}
        api={readersApi}
      />
    </div>
  );
};

export default ReadersPage;