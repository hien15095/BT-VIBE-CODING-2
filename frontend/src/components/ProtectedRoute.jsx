// Component bảo vệ route theo trạng thái đăng nhập và role
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const ProtectedRoute = ({ children, roles }) => {
  const { user } = useAuth();

  // Chưa đăng nhập thì chuyển về login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Nếu có danh sách role, kiểm tra quyền
  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;