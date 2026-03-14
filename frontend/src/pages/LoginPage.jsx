// Trang đăng nhập chung: nhân viên hoặc sinh viên
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginApi } from '../api/auth.js';
import { readerLoginApi } from '../api/readerAuth.js';
import { useAuth } from '../context/AuthContext.jsx';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [mode, setMode] = useState('staff');
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const payload =
        mode === 'staff'
          ? { username: form.username, password: form.password }
          : { reader_id: form.username, password: form.password };

      const res = mode === 'staff' ? await loginApi(payload) : await readerLoginApi(payload);
      login(res.data);

      // Điều hướng theo role
      if (res.data.user.role === 'reader') {
        navigate('/reader');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Dang nhap that bai');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="text-2xl font-semibold mb-2">Đăng nhập</div>
        <div className="text-sm text-slate-500 mb-6">Library Management System</div>

        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setMode('staff')}
            className={`flex-1 px-3 py-2 rounded-lg text-sm ${
              mode === 'staff' ? 'bg-brand-600 text-white' : 'bg-slate-100'
            }`}
          >
            Nhân viên
          </button>
          <button
            type="button"
            onClick={() => setMode('reader')}
            className={`flex-1 px-3 py-2 rounded-lg text-sm ${
              mode === 'reader' ? 'bg-brand-600 text-white' : 'bg-slate-100'
            }`}
          >
            Sinh viên
          </button>
        </div>

        {error && <div className="text-sm text-red-600 mb-3">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">
              {mode === 'staff' ? 'Username' : 'Mã độc giả'}
            </label>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              className="w-full rounded-lg border-slate-200"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full rounded-lg border-slate-200"
              required
            />
          </div>

          <button className="w-full py-2 rounded-lg bg-brand-600 text-white">Đăng nhập</button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;