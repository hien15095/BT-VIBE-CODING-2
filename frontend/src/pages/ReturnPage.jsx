// Trang trả sách
import { useState } from 'react';
import borrowApi from '../api/borrow.js';

const ReturnPage = () => {
  const [form, setForm] = useState({ borrow_id: '', book_condition: 'good' });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setMessage('');
      const res = await borrowApi.returnBook(form);
      setMessage(res.data.message || 'Trả sách thành công');
      setForm({ borrow_id: '', book_condition: 'good' });
    } catch (err) {
      setMessage(err.response?.data?.message || 'Trả sách thất bại');
    }
  };

  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-2xl font-semibold">Trả sách</h1>

      {message && <div className="text-sm text-brand-700">{message}</div>}

      <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl border border-slate-200 space-y-4">
        <div>
          <label className="text-sm font-medium">Mã phiếu mượn (borrow_id)</label>
          <input
            name="borrow_id"
            value={form.borrow_id}
            onChange={handleChange}
            className="w-full rounded-lg border-slate-200"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium">Tình trạng sách</label>
          <select
            name="book_condition"
            value={form.book_condition}
            onChange={handleChange}
            className="w-full rounded-lg border-slate-200"
          >
            <option value="good">Tốt</option>
            <option value="damaged">Hỏng</option>
            <option value="lost">Mất</option>
          </select>
        </div>

        <button className="px-4 py-2 rounded-lg bg-brand-600 text-white">Xác nhận trả</button>
      </form>
    </div>
  );
};

export default ReturnPage;