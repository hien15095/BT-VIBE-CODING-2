// Trang báo cáo thống kê
import { useEffect, useState } from 'react';
import reportsApi from '../api/reports.js';

const ReportsPage = () => {
  const [mostBorrowed, setMostBorrowed] = useState([]);
  const [unreturned, setUnreturned] = useState([]);

  const load = async () => {
    try {
      const [a, b] = await Promise.all([
        reportsApi.mostBorrowed(10),
        reportsApi.unreturned()
      ]);
      setMostBorrowed(a.data);
      setUnreturned(b.data);
    } catch {
      // Nếu lỗi thì bỏ qua
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Báo cáo thống kê</h1>

      <div className="bg-white rounded-xl p-4 border border-slate-200">
        <div className="text-lg font-semibold mb-3">Top sách mượn nhiều</div>
        <table className="min-w-full text-sm">
          <thead className="text-left text-slate-500">
            <tr>
              <th className="py-2">Mã sách</th>
              <th className="py-2">Tên sách</th>
              <th className="py-2">Lượt mượn</th>
            </tr>
          </thead>
          <tbody>
            {mostBorrowed.map((b) => (
              <tr key={b.book_id} className="border-t">
                <td className="py-2">{b.book_id}</td>
                <td className="py-2">{b.title}</td>
                <td className="py-2">{b.total_borrowed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-xl p-4 border border-slate-200">
        <div className="text-lg font-semibold mb-3">Độc giả chưa trả sách</div>
        <table className="min-w-full text-sm">
          <thead className="text-left text-slate-500">
            <tr>
              <th className="py-2">Mã phiếu</th>
              <th className="py-2">Độc giả</th>
              <th className="py-2">Sách</th>
              <th className="py-2">Ngày mượn</th>
            </tr>
          </thead>
          <tbody>
            {unreturned.map((r) => (
              <tr key={r.borrow_id} className="border-t">
                <td className="py-2">{r.borrow_id}</td>
                <td className="py-2">{r.full_name}</td>
                <td className="py-2">{r.title}</td>
                <td className="py-2">{new Date(r.borrow_date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportsPage;