// Layout riêng cho sinh viên (không dùng sidebar admin)
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const ReaderLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen">
      <header className="px-6 py-4 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-500">Cổng sinh viên</div>
            <div className="text-lg font-semibold">Hệ thống Quản lý Thư viện</div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-medium">{user?.username}</div>
              <div className="text-xs text-slate-500">{user?.class}</div>
            </div>
            <button
              onClick={logout}
              className="px-3 py-2 rounded-lg bg-slate-900 text-white text-sm hover:bg-slate-800"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-5xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default ReaderLayout;
