// Component CRUD tổng quát để tái sử dụng cho nhiều trang
import { useEffect, useState } from 'react';

const CrudPage = ({
  title,
  idField,
  columns,
  formFields,
  api,
  searchable = false,
  filters = []
}) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [filterValues, setFilterValues] = useState(() => {
    const init = {};
    filters.forEach((f) => (init[f.name] = ''));
    return init;
  });
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(() => {
    const init = {};
    formFields.forEach((f) => (init[f.name] = ''));
    return init;
  });

  // Tải dữ liệu từ server (server-side pagination)
  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const params = {
        page,
        pageSize
      };

      if (searchable && search.trim()) params.search = search.trim();

      filters.forEach((f) => {
        const val = filterValues[f.name];
        if (val) params[f.name] = val;
      });

      const res = await api.list(params);

      // Dạng chuẩn: { items, total, page, pageSize }
      const data = res.data.items ? res.data : { items: res.data, total: res.data.length, page, pageSize };
      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError('Khong the tai du lieu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, search, filterValues]);

  // Khi thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit form tạo/cập nhật
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');

      // Dữ liệu gửi lên chỉ lấy từ formFields
      const payload = {};
      formFields.forEach((f) => {
        payload[f.name] = formData[f.name];
      });

      if (editingId) {
        await api.update(editingId, payload);
      } else {
        await api.create(payload);
      }

      // Reset form sau khi submit
      setEditingId(null);
      const reset = {};
      formFields.forEach((f) => (reset[f.name] = ''));
      setFormData(reset);

      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Loi khi luu du lieu');
    }
  };

  // Bấm sửa -> đổ dữ liệu lên form
  const handleEdit = (item) => {
    setEditingId(item[idField]);
    const next = {};
    formFields.forEach((f) => {
      next[f.name] = item[f.name] ?? '';
    });
    setFormData(next);
  };

  // Xóa bản ghi
  const handleDelete = async (id) => {
    if (!window.confirm('Ban chac chan muon xoa?')) return;
    try {
      await api.remove(id);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Loi khi xoa');
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-semibold">{title}</h1>

        <div className="flex flex-wrap items-center gap-2">
          {searchable && (
            <div className="flex gap-2">
              <input
                className="rounded-lg border-slate-200 text-sm"
                placeholder="Tim kiem..."
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
              />
              <button
                onClick={() => setPage(1)}
                className="px-3 py-2 rounded-lg bg-brand-600 text-white text-sm"
              >
                Tìm
              </button>
            </div>
          )}

          {filters.map((f) => (
            <select
              key={f.name}
              value={filterValues[f.name]}
              onChange={(e) => {
                setPage(1);
                setFilterValues((prev) => ({ ...prev, [f.name]: e.target.value }));
              }}
              className="rounded-lg border-slate-200 text-sm"
            >
              <option value="">{f.label}</option>
              {f.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ))}

          <select
            value={pageSize}
            onChange={(e) => {
              setPage(1);
              setPageSize(Number(e.target.value));
            }}
            className="rounded-lg border-slate-200 text-sm"
          >
            <option value={10}>10 / trang</option>
            <option value={20}>20 / trang</option>
            <option value={50}>50 / trang</option>
          </select>
        </div>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
        <div className="grid md:grid-cols-2 gap-4">
          {formFields.map((field) => (
            <div key={field.name} className="space-y-1">
              <label className="text-sm font-medium">{field.label}</label>

              {field.type === 'select' ? (
                <select
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  required={field.required}
                  disabled={editingId && field.lockedOnEdit}
                  className="w-full rounded-lg border-slate-200"
                >
                  <option value="">-- Chon --</option>
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type || 'text'}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  required={field.required}
                  readOnly={editingId && field.lockedOnEdit}
                  className="w-full rounded-lg border-slate-200"
                />
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <button className="px-4 py-2 rounded-lg bg-brand-600 text-white">
            {editingId ? 'Cap nhat' : 'Them moi'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                const reset = {};
                formFields.forEach((f) => (reset[f.name] = ''));
                setFormData(reset);
              }}
              className="px-4 py-2 rounded-lg border border-slate-300"
            >
              Huy
            </button>
          )}
        </div>
      </form>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
        {loading ? (
          <div className="text-sm text-slate-500">Dang tai du lieu...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-slate-500">
                <tr>
                  {columns.map((col) => (
                    <th key={col.key} className="py-2 pr-4">
                      {col.label}
                    </th>
                  ))}
                  <th className="py-2">Hanh dong</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item[idField]} className="border-t">
                    {columns.map((col) => (
                      <td key={col.key} className="py-2 pr-4">
                        {item[col.key]}
                      </td>
                    ))}
                    <td className="py-2 flex gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="px-2 py-1 rounded bg-slate-100"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(item[idField])}
                        className="px-2 py-1 rounded bg-red-100 text-red-700"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between text-sm">
          <div>
            {total === 0 ? 'Khong co du lieu' : `Tong ${total} ban ghi`}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1 rounded border border-slate-300 disabled:opacity-50"
            >
              Trước
            </button>
            <span>
              Trang {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1 rounded border border-slate-300 disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrudPage;