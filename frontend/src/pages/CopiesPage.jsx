// Trang quản lý bản sao sách
import { useState } from 'react';
import CrudPage from '../components/CrudPage.jsx';
import copiesApi from '../api/copies.js';

const CopiesPage = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Upload CSV để tạo hàng loạt bản sao
  const handleImport = async () => {
    try {
      if (!file) {
        setMessage('Vui long chon file CSV');
        return;
      }

      const res = await copiesApi.importCsv(file);
      setMessage(`Da import: ${res.data.inserted}, Loi: ${res.data.failed}`);
      setErrors(res.data.errors || []);
      setFile(null);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Import that bai');
      setErrors(err.response?.data?.errors || []);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-4 border border-slate-200">
        <div className="text-lg font-semibold mb-3">Import bản sao từ CSV</div>
        <div className="text-sm text-slate-500 mb-2">
          CSV header: book_id, status, import_date
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
        title="Quản lý bản sao"
        idField="copy_id"
        searchable
        filters={[
          {
            name: 'status',
            label: 'Trạng thái',
            options: [
              { value: 'available', label: 'Có sẵn' },
              { value: 'borrowed', label: 'Đang mượn' },
              { value: 'damaged', label: 'Hỏng' }
            ]
          }
        ]}
        columns={[
          { key: 'copy_id', label: 'Mã bản sao' },
          { key: 'book_id', label: 'Mã sách' },
          { key: 'title', label: 'Tên sách' },
          { key: 'status', label: 'Trạng thái' },
          { key: 'import_date', label: 'Ngày nhập' }
        ]}
        formFields={[
          { name: 'book_id', label: 'Mã sách', required: true },
          {
            name: 'status',
            label: 'Trạng thái',
            type: 'select',
            required: true,
            options: [
              { value: 'available', label: 'Có sẵn' },
              { value: 'borrowed', label: 'Đang mượn' },
              { value: 'damaged', label: 'Hỏng' }
            ]
          },
          { name: 'import_date', label: 'Ngày nhập', type: 'date', required: true }
        ]}
        api={copiesApi}
      />
    </div>
  );
};

export default CopiesPage;