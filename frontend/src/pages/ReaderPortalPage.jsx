// Trang portal sinh viên: xem sách + tình trạng mượn
import { useEffect, useState } from 'react';
import readerPortalApi from '../api/readerPortal.js';
import categoriesApi from '../api/categories.js';

const ReaderPortalPage = () => {
  const [tab, setTab] = useState('books');
  const [books, setBooks] = useState([]);
  const [borrow, setBorrow] = useState([]);
  const [requests, setRequests] = useState([]);
  const [profile, setProfile] = useState(null);
  const [summary, setSummary] = useState({ books: 0, available: 0, borrowed: 0, pending: 0 });
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [reqStatus, setReqStatus] = useState('');
  const [reqPage, setReqPage] = useState(1);
  const [reqTotal, setReqTotal] = useState(0);
  const reqPageSize = 10;
  const [pwdForm, setPwdForm] = useState({ old_password: '', new_password: '' });
  const [pwdMessage, setPwdMessage] = useState('');

  const load = async () => {
    try {
      setError('');
      setLoading(true);
      const [booksRes, borrowRes, categoriesRes, summaryRes, profileRes] = await Promise.all([
        readerPortalApi.listBooks(search, categoryId),
        readerPortalApi.myBorrow(),
        categories.length === 0 ? categoriesApi.listAll() : Promise.resolve({ data: categories }),
        readerPortalApi.summary(),
        readerPortalApi.profile()
      ]);
      setBooks(booksRes.data);
      setBorrow(borrowRes.data);
      if (categories.length === 0) {
        setCategories(categoriesRes.data || []);
      }
      setSummary(summaryRes.data || { books: 0, available: 0, borrowed: 0, pending: 0 });
      setProfile(profileRes.data || null);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Tìm kiếm có debounce để đỡ "ngu" và giảm spam API
  useEffect(() => {
    const t = setTimeout(() => {
      load();
    }, 400);
    return () => clearTimeout(t);
  }, [search, categoryId]);

  const loadRequests = async (p = reqPage) => {
    try {
      const res = await readerPortalApi.listRequests({
        page: p,
        pageSize: reqPageSize,
        status: reqStatus
      });
      setRequests(res.data.items || []);
      setReqTotal(res.data.total || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải yêu cầu');
    }
  };

  useEffect(() => {
    loadRequests(1);
    setReqPage(1);
  }, [reqStatus]);

  const handleRequest = async (book_id) => {
    try {
      setMessage('');
      const res = await readerPortalApi.requestBorrow(book_id);
      setMessage(res.data.message || 'Gửi yêu cầu thành công');
      await load();
      if (tab === 'requests') {
        await loadRequests();
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Gửi yêu cầu thất bại');
    }
  };

  const handleCancel = async (id) => {
    try {
      setMessage('');
      const res = await readerPortalApi.cancelRequest(id);
      setMessage(res.data.message || 'Đã hủy yêu cầu');
      await loadRequests();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Hủy yêu cầu thất bại');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      setPwdMessage('');
      if (!pwdForm.old_password || !pwdForm.new_password) {
        setPwdMessage('Vui lòng nhập đủ mật khẩu cũ và mới');
        return;
      }
      const res = await readerPortalApi.changePassword(pwdForm);
      setPwdMessage(res.data.message || 'Đổi mật khẩu thành công');
      setPwdForm({ old_password: '', new_password: '' });
    } catch (err) {
      setPwdMessage(err.response?.data?.message || 'Đổi mật khẩu thất bại');
    }
  };

  const statusLabel = (s) => {
    if (s === 'pending') return 'Đang chờ';
    if (s === 'approved') return 'Đã duyệt';
    if (s === 'rejected') return 'Từ chối';
    return s || '';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Sinh viên</h1>
        {tab === 'books' && (
          <div className="flex gap-2">
            <input
              className="rounded-lg border-slate-200 text-sm"
              placeholder="Tìm theo tên, tác giả, mã sách, chuyên ngành"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="rounded-lg border-slate-200 text-sm"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">Tất cả chuyên ngành</option>
              {categories.map((c) => (
                <option key={c.category_id} value={c.category_id}>
                  {c.category_name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {message && <div className="text-sm text-brand-700">{message}</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="text-xs text-slate-500">Tổng đầu sách</div>
          <div className="text-2xl font-semibold">{summary.books}</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="text-xs text-slate-500">Bản sao khả dụng</div>
          <div className="text-2xl font-semibold">{summary.available}</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="text-xs text-slate-500">Sách đang mượn</div>
          <div className="text-2xl font-semibold">{summary.borrowed}</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="text-xs text-slate-500">Yêu cầu đang chờ</div>
          <div className="text-2xl font-semibold">{summary.pending}</div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setTab('books')}
          className={`px-4 py-2 rounded-lg text-sm ${
            tab === 'books' ? 'bg-brand-600 text-white' : 'bg-white border border-slate-200'
          }`}
        >
          Kho sách
        </button>
        <button
          onClick={() => setTab('requests')}
          className={`px-4 py-2 rounded-lg text-sm ${
            tab === 'requests' ? 'bg-brand-600 text-white' : 'bg-white border border-slate-200'
          }`}
        >
          Yêu cầu của tôi
        </button>
        <button
          onClick={() => setTab('borrows')}
          className={`px-4 py-2 rounded-lg text-sm ${
            tab === 'borrows' ? 'bg-brand-600 text-white' : 'bg-white border border-slate-200'
          }`}
        >
          Lịch sử mượn
        </button>
        <button
          onClick={() => setTab('profile')}
          className={`px-4 py-2 rounded-lg text-sm ${
            tab === 'profile' ? 'bg-brand-600 text-white' : 'bg-white border border-slate-200'
          }`}
        >
          Tài khoản
        </button>
      </div>

      {tab === 'books' && (
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="text-lg font-semibold mb-3">Danh sách đầu sách</div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-slate-500">
                <tr>
                  <th className="py-2">Mã sách</th>
                  <th className="py-2">Tên sách</th>
                  <th className="py-2">Tác giả</th>
                  <th className="py-2">Chuyên ngành</th>
                  <th className="py-2">Còn trống</th>
                  <th className="py-2">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {books.map((b) => (
                  <tr key={b.book_id} className="border-t">
                    <td className="py-2">{b.book_id}</td>
                    <td className="py-2">{b.title}</td>
                    <td className="py-2">{b.author}</td>
                  <td className="py-2">{b.category_name || 'Chưa phân loại'}</td>
                    <td className="py-2">{b.available_copies ?? 0}</td>
                    <td className="py-2">
                      <button
                        disabled={!b.available_copies || loading}
                        onClick={() => handleRequest(b.book_id)}
                        className={`px-3 py-1.5 rounded-lg text-white text-xs ${
                          b.available_copies ? 'bg-brand-600' : 'bg-slate-300 cursor-not-allowed'
                        }`}
                      >
                        Yêu cầu mượn
                      </button>
                    </td>
                  </tr>
                ))}
                {books.length === 0 && (
                  <tr>
                    <td className="py-3 text-slate-500" colSpan={6}>
                      Không có dữ liệu
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'requests' && (
        <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold">Yêu cầu mượn của tôi</div>
            <select
              className="rounded-lg border-slate-200 text-sm"
              value={reqStatus}
              onChange={(e) => setReqStatus(e.target.value)}
            >
              <option value="">Tất cả</option>
              <option value="pending">Đang chờ</option>
              <option value="approved">Đã duyệt</option>
              <option value="rejected">Từ chối</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-slate-500">
                <tr>
                  <th className="py-2">Mã yêu cầu</th>
                  <th className="py-2">Sách</th>
                  <th className="py-2">Ngày gửi</th>
                  <th className="py-2">Trạng thái</th>
                  <th className="py-2">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.request_id} className="border-t">
                    <td className="py-2">{r.request_id}</td>
                    <td className="py-2">
                      {r.book_id} - {r.title}
                    </td>
                    <td className="py-2">
                      {r.request_date ? new Date(r.request_date).toLocaleDateString() : ''}
                    </td>
                    <td className="py-2">{statusLabel(r.status)}</td>
                    <td className="py-2">
                      {r.status === 'pending' ? (
                        <button
                          onClick={() => handleCancel(r.request_id)}
                          className="px-3 py-1.5 rounded-lg bg-slate-200 text-xs"
                        >
                          Hủy
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs">Đã xử lý</span>
                      )}
                    </td>
                  </tr>
                ))}
                {requests.length === 0 && (
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
              Tổng: <b>{reqTotal}</b>
            </div>
            <div className="flex gap-2">
              <button
                className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-50"
                disabled={reqPage <= 1}
                onClick={() => {
                  const p = reqPage - 1;
                  setReqPage(p);
                  loadRequests(p);
                }}
              >
                Trước
              </button>
              <button
                className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-50"
                disabled={reqPage * reqPageSize >= reqTotal}
                onClick={() => {
                  const p = reqPage + 1;
                  setReqPage(p);
                  loadRequests(p);
                }}
              >
                Sau
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === 'borrows' && (
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="text-lg font-semibold mb-3">Sách đang mượn</div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-slate-500">
                <tr>
                  <th className="py-2">Mã phiếu</th>
                  <th className="py-2">Mã sách</th>
                  <th className="py-2">Tên sách</th>
                  <th className="py-2">Ngày mượn</th>
                  <th className="py-2">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {borrow.map((b) => (
                  <tr key={b.borrow_id} className="border-t">
                    <td className="py-2">{b.borrow_id}</td>
                    <td className="py-2">{b.book_id}</td>
                    <td className="py-2">{b.title}</td>
                    <td className="py-2">{new Date(b.borrow_date).toLocaleDateString()}</td>
                  <td className="py-2">{b.status}</td>
                </tr>
              ))}
                {borrow.length === 0 && (
                  <tr>
                    <td className="py-3 text-slate-500" colSpan={5}>
                      Chưa có lịch sử mượn
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-2">
            <div className="text-lg font-semibold">Thông tin sinh viên</div>
            <div className="text-sm text-slate-600">
              Mã độc giả: <b>{profile?.reader_id}</b>
            </div>
            <div className="text-sm text-slate-600">
              Họ tên: <b>{profile?.full_name}</b>
            </div>
            <div className="text-sm text-slate-600">
              Lớp: <b>{profile?.class}</b>
            </div>
            <div className="text-sm text-slate-600">
              Ngày sinh:{' '}
              <b>{profile?.birth_date ? new Date(profile.birth_date).toLocaleDateString() : ''}</b>
            </div>
            <div className="text-sm text-slate-600">
              Giới tính: <b>{profile?.gender}</b>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="bg-white rounded-xl p-4 border border-slate-200 space-y-3">
            <div className="text-lg font-semibold">Đổi mật khẩu</div>
            {pwdMessage && <div className="text-sm text-brand-700">{pwdMessage}</div>}
            <div>
              <label className="text-sm font-medium">Mật khẩu cũ</label>
              <input
                type="password"
                className="w-full rounded-lg border-slate-200"
                value={pwdForm.old_password}
                onChange={(e) => setPwdForm((p) => ({ ...p, old_password: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Mật khẩu mới</label>
              <input
                type="password"
                className="w-full rounded-lg border-slate-200"
                value={pwdForm.new_password}
                onChange={(e) => setPwdForm((p) => ({ ...p, new_password: e.target.value }))}
              />
            </div>
            <button className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm">
              Cập nhật
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ReaderPortalPage;
