// Trang quản lý đầu sách
import { useEffect, useState } from 'react';
import CrudPage from '../components/CrudPage.jsx';
import booksApi from '../api/books.js';
import categoriesApi from '../api/categories.js';

const BooksPage = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [categories, setCategories] = useState([]);

  // Load danh sách chuyên ngành để filter/select
  const loadCategories = async () => {
    try {
      const res = await categoriesApi.listAll();
      setCategories(res.data || []);
    } catch {
      setCategories([]);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Upload CSV để tạo hàng loạt đầu sách
  const handleImport = async () => {
    try {
      if (!file) {
        setMessage('Vui long chon file CSV');
        return;
      }

      const res = await booksApi.importCsv(file);
      setMessage(`Da import: ${res.data.inserted}, Loi: ${res.data.failed}`);
      setErrors(res.data.errors || []);
      setFile(null);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Import that bai');
      setErrors(err.response?.data?.errors || []);
    }
  };

  const categoryOptions = categories.map((c) => ({
    value: String(c.category_id),
    label: `${c.category_id} - ${c.category_name}`
  }));

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-4 border border-slate-200">
        <div className="text-lg font-semibold mb-3">Import đầu sách từ CSV</div>
        <div className="text-sm text-slate-500 mb-2">
          CSV header: book_id, title, publisher, number_of_pages, size, author, category_id
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
        title="Quản lý đầu sách"
        idField="book_id"
        searchable
        filters={[
          {
            name: 'category_id',
            label: 'Chuyên ngành',
            options: categoryOptions
          }
        ]}
        columns={[
          { key: 'book_id', label: 'Mã sách' },
          { key: 'title', label: 'Tên sách' },
          { key: 'author', label: 'Tác giả' },
          { key: 'publisher', label: 'Nhà xuất bản' },
          { key: 'category_name', label: 'Chuyên ngành' }
        ]}
        formFields={[
          { name: 'book_id', label: 'Mã sách', required: true, lockedOnEdit: true },
          { name: 'title', label: 'Tên sách', required: true },
          { name: 'author', label: 'Tác giả' },
          { name: 'publisher', label: 'Nhà xuất bản' },
          { name: 'number_of_pages', label: 'Số trang', type: 'number' },
          { name: 'size', label: 'Kích thước' },
          {
            name: 'category_id',
            label: 'Chuyên ngành',
            type: 'select',
            required: true,
            options: categoryOptions
          }
        ]}
        api={booksApi}
      />
    </div>
  );
};

export default BooksPage;