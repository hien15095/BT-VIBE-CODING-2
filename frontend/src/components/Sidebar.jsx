// Sidebar menu điều hướng
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Sidebar = () => {
  const { user } = useAuth();

  // Danh sách menu cơ bản
  const items = [
    { path: '/dashboard', label: 'Dashboard', roles: ['admin', 'librarian', 'leader'] },
    { path: '/readers', label: 'Độc giả', roles: ['admin', 'librarian'] },
    { path: '/categories', label: 'Chuyên ngành', roles: ['admin', 'librarian'] },
    { path: '/books', label: 'Đầu sách', roles: ['admin', 'librarian'] },
    { path: '/copies', label: 'Bản sao', roles: ['admin', 'librarian'] },
    { path: '/borrow', label: 'Mượn sách', roles: ['librarian'] },
    { path: '/return', label: 'Trả sách', roles: ['librarian'] },
    { path: '/reports', label: 'Báo cáo', roles: ['admin', 'librarian', 'leader'] },
    { path: '/users', label: 'Tài khoản', roles: ['admin'] }
  ];

  return (
    <aside className="w-72 bg-white/90 backdrop-blur border-r border-slate-200 p-4">
      <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-sky-500 to-emerald-400 text-white">
        <div className="text-xl font-bold">Library LMS</div>
        <div className="text-xs text-white/80">University Edition</div>
      </div>

      <nav className="space-y-2">
        {items
          .filter((item) => !user || item.roles.includes(user.role))
          .map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-2xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-sky-50 text-sky-700 border border-sky-100'
                    : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              <span className="h-3 w-3 rounded-full bg-sky-400"></span>
              {item.label}
            </NavLink>
          ))}
      </nav>
    </aside>
  );
};

export default Sidebar;