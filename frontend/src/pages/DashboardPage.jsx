// Trang Dashboard tổng quan
import { useEffect, useMemo, useState } from 'react';
import reportsApi from '../api/reports.js';

const DashboardPage = () => {
  const [mostBorrowed, setMostBorrowed] = useState([]);
  const [trend, setTrend] = useState([]);
  const [summary, setSummary] = useState({
    readers: 0,
    books: 0,
    copies: 0,
    borrowing: 0,
    totalBorrowRecords: 0
  });

  // Lấy số liệu tổng quan + top sách + trend
  const load = async () => {
    try {
      const [a, b, c] = await Promise.all([
        reportsApi.mostBorrowed(6),
        reportsApi.summary(),
        reportsApi.borrowTrend()
      ]);
      setMostBorrowed(a.data);
      setSummary(b.data);
      setTrend(c.data);
    } catch {
      // Nếu lỗi thì giữ dữ liệu mặc định
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Dùng để vẽ thanh bar tương đối
  const maxBorrow = Math.max(1, ...mostBorrowed.map((b) => b.total_borrowed));

  // Tạo points cho line chart
  const linePoints = useMemo(() => {
    if (!trend.length) return '';
    const w = 520;
    const h = 180;
    const pad = 24;
    const max = Math.max(1, ...trend.map((t) => t.total));

    return trend
      .map((t, i) => {
        const x = pad + (i / Math.max(1, trend.length - 1)) * (w - pad * 2);
        const y = h - pad - (t.total / max) * (h - pad * 2);
        return `${x},${y}`;
      })
      .join(' ');
  }, [trend]);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-5 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200">
          <div className="text-sm text-slate-500">Độc giả</div>
          <div className="text-2xl font-semibold">{summary.readers}</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200">
          <div className="text-sm text-slate-500">Đầu sách</div>
          <div className="text-2xl font-semibold">{summary.books}</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200">
          <div className="text-sm text-slate-500">Bản sao</div>
          <div className="text-2xl font-semibold">{summary.copies}</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200">
          <div className="text-sm text-slate-500">Đang mượn</div>
          <div className="text-2xl font-semibold">{summary.borrowing}</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200">
          <div className="text-sm text-slate-500">Tổng phiếu</div>
          <div className="text-2xl font-semibold">{summary.totalBorrowRecords}</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="text-lg font-semibold mb-3">Xu hướng mượn (6 tháng)</div>
          <div className="w-full overflow-x-auto">
            <svg width="520" height="180" viewBox="0 0 520 180" className="text-brand-500">
              <polyline
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                points={linePoints}
              />
            </svg>
          </div>
          <div className="mt-2 grid grid-cols-6 text-xs text-slate-500">
            {trend.map((t) => (
              <div key={t.ym} className="text-center">{t.ym}</div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="text-lg font-semibold mb-3">Top sách mượn nhiều</div>
          <div className="space-y-3">
            {mostBorrowed.map((b) => (
              <div key={b.book_id} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{b.title}</span>
                  <span className="text-slate-500">{b.total_borrowed}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-brand-500"
                    style={{ width: `${(b.total_borrowed / maxBorrow) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;