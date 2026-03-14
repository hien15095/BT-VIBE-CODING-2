// Thanh topbar hiển thị user và nút đăng xuất
import { useAuth } from '../context/AuthContext.jsx';

const Topbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="px-6 py-4 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-slate-500 uppercase tracking-wide">Library System</div>
          <div className="text-lg font-semibold">Bảng điều khiển</div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-medium">{user?.username || 'Guest'}</div>
            <div className="text-xs text-slate-500">{user?.role || ''}</div>
          </div>
          {user && (
            <button
              onClick={logout}
              className="px-3 py-2 rounded-lg bg-gradient-to-r from-sky-500 to-emerald-400 text-white text-sm"
            >
              Đăng xuất
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;