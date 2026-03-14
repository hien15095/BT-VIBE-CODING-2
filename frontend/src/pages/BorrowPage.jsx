// Trang mượn sách
import { useEffect, useState } from 'react';
import borrowApi from '../api/borrow.js';
import borrowRequestsApi from '../api/borrowRequests.js';
import { useAuth } from '../context/AuthContext.jsx';

const BorrowPage = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({ copy_id: '', reader_id: '' });
  const [message, setMessage] = useState('');
  const [reqs, setReqs] = useState([]);
  const [reqMessage, setReqMessage] = useState('');
  const [reqSearch, setReqSearch] = useState('');
  const [reqStatus, setReqStatus] = useState('pending');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  const loadRequests = async (p = page) => {
    try {
      const res = await borrowRequestsApi.list({
        page: p,
        pageSize,
        search: reqSearch,
        status: reqStatus
      });
      setReqs(res.data.items || []);
      setTotal(res.data.total || 0);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadRequests(1);
    setPage(1);
  }, [reqSearch, reqStatus]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setMessage('');
      const res = await borrowApi.borrow(form);
      setMessage(res.data.message || 'Mượn sách thành công');
      setForm({ copy_id: '', reader_id: '' });
    } catch (err) {
      setMessage(err.response?.data?.message || 'Mượn sách thất bại');
    }
  };

  const handleApprove = async (id) => {
    try {
      setReqMessage('');
      const res = await borrowRequestsApi.approve(id);
      setReqMessage(res.data.message || 'Duyet thanh cong');
      await loadRequests();
    } catch (err) {
      setReqMessage(err.response?.data?.message || 'Duyet that bai');
    }
  };

  const handleReject = async (id) => {
    try {
      setReqMessage('');
      const res = await borrowRequestsApi.reject(id);
      setReqMessage(res.data.message || 'Tu choi thanh cong');
      await loadRequests();
    } catch (err) {
      setReqMessage(err.response?.data?.message || 'Tu choi that bai');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Mượn sách</h1>

      <div className="text-sm text-slate-500">
        Thủ thư đang đăng nhập: <b>{user?.username}</b>
      </div>

      {message && <div className="text-sm text-brand-700">{message}</div>}

      <form onSubmit={handleSubmit} className="max-w-xl bg-white p-4 rounded-xl border border-slate-200 space-y-4">
        <div>
          <label className="text-sm font-medium">Mã bản sao (copy_id)</label>
          <input
            name="copy_id"
            value={form.copy_id}
            onChange={handleChange}
            className="w-full rounded-lg border-slate-200"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium">Mã độc giả (reader_id)</label>
          <input
            name="reader_id"
            value={form.reader_id}
            onChange={handleChange}
            className="w-full rounded-lg border-slate-200"
            required
          />
        </div>

        <button className="px-4 py-2 rounded-lg bg-brand-600 text-white">Xác nhận mượn</button>
      </form>

      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold">Yêu cầu mượn từ sinh viên</div>
          <div className="flex gap-2">
            <input
              className="rounded-lg border-slate-200 text-sm"
              placeholder="Tìm theo độc giả / sách"
              value={reqSearch}
              onChange={(e) => setReqSearch(e.target.value)}
            />
            <select
              className="rounded-lg border-slate-200 text-sm"
              value={reqStatus}
              onChange={(e) => setReqStatus(e.target.value)}
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="">Tất cả</option>
            </select>
          </div>
        </div>

        {reqMessage && <div className="text-sm text-brand-700">{reqMessage}</div>}

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-slate-500">
              <tr>
                <th className="py-2">Mã yêu cầu</th>
                <th className="py-2">Độc giả</th>
                <th className="py-2">Sách</th>
                <th className="py-2">Trạng thái</th>
                <th className="py-2">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {reqs.map((r) => (
                <tr key={r.request_id} className="border-t">
                  <td className="py-2">{r.request_id}</td>
                  <td className="py-2">
                    {r.reader_id} - {r.full_name}
                  </td>
                  <td className="py-2">
                    {r.book_id} - {r.title}
                  </td>
                  <td className="py-2">{r.status}</td>
                  <td className="py-2">
                    {r.status === 'pending' ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(r.request_id)}
                          className="px-3 py-1.5 rounded-lg bg-brand-600 text-white text-xs"
                        >
                          Duyệt
                        </button>
                        <button
                          onClick={() => handleReject(r.request_id)}
                          className="px-3 py-1.5 rounded-lg bg-slate-200 text-xs"
                        >
                          Từ chối
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-500 text-xs">Đã xử lý</span>
                    )}
                  </td>
                </tr>
              ))}
              {reqs.length === 0 && (
                <tr>
                  <td className="py-3 text-slate-500" colSpan={5}>
                    Không có yêu cầu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between text-sm text-slate-500">
          <div>
            Tổng: <b>{total}</b>
          </div>
          <div className="flex gap-2">
            <button
              className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-50"
              disabled={page <= 1}
              onClick={() => {
                const p = page - 1;
                setPage(p);
                loadRequests(p);
              }}
            >
              Trước
            </button>
            <button
              className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-50"
              disabled={page * pageSize >= total}
              onClick={() => {
                const p = page + 1;
                setPage(p);
                loadRequests(p);
              }}
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BorrowPage;
