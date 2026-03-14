// Trang quản lý tài khoản nhân viên
import { useState } from 'react';
import CrudPage from '../components/CrudPage.jsx';
import usersApi from '../api/users.js';

const UsersPage = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Upload CSV để tạo hàng loạt user
  const handleImport = async () => {
    try {
      if (!file) {
        setMessage('Vui long chon file CSV');
        return;
      }

      const res = await usersApi.importCsv(file);
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
        <div className="text-lg font-semibold mb-3">Import tài khoản từ CSV</div>
        <div className="text-sm text-slate-500 mb-2">
          CSV header: username, password, role
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
        title="Quản lý tài khoản"
        idField="user_id"
        searchable
        filters={[
          {
            name: 'role',
            label: 'Role',
            options: [
              { value: 'admin', label: 'Admin' },
              { value: 'librarian', label: 'Librarian' },
              { value: 'leader', label: 'Leader' }
            ]
          }
        ]}
        columns={[
          { key: 'user_id', label: 'ID' },
          { key: 'username', label: 'Username' },
          { key: 'role', label: 'Role' },
          { key: 'created_at', label: 'Ngày tạo' }
        ]}
        formFields={[
          { name: 'username', label: 'Username', required: true },
          { name: 'password', label: 'Password', type: 'password' },
          {
            name: 'role',
            label: 'Role',
            type: 'select',
            required: true,
            options: [
              { value: 'admin', label: 'Admin' },
              { value: 'librarian', label: 'Librarian' },
              { value: 'leader', label: 'Leader' }
            ]
          }
        ]}
        api={usersApi}
      />
    </div>
  );
};

export default UsersPage;