// Định nghĩa routing cho frontend
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ReadersPage from './pages/ReadersPage.jsx';
import CategoriesPage from './pages/CategoriesPage.jsx';
import BooksPage from './pages/BooksPage.jsx';
import CopiesPage from './pages/CopiesPage.jsx';
import BorrowPage from './pages/BorrowPage.jsx';
import ReturnPage from './pages/ReturnPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import UsersPage from './pages/UsersPage.jsx';
import ReaderLayout from './components/ReaderLayout.jsx';
import ReaderPortalPage from './pages/ReaderPortalPage.jsx';

const App = () => {
  return (
    <Routes>
      {/* Trang login không cần auth */}
      <Route path="/login" element={<LoginPage />} />

      {/* Portal sinh viên */}
      <Route
        path="/reader"
        element={
          <ProtectedRoute roles={['reader']}>
            <ReaderLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ReaderPortalPage />} />
      </Route>

      {/* Các trang có auth dùng Layout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />

        <Route
          path="readers"
          element={
            <ProtectedRoute roles={['admin', 'librarian']}>
              <ReadersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="categories"
          element={
            <ProtectedRoute roles={['admin', 'librarian']}>
              <CategoriesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="books"
          element={
            <ProtectedRoute roles={['admin', 'librarian']}>
              <BooksPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="copies"
          element={
            <ProtectedRoute roles={['admin', 'librarian']}>
              <CopiesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="borrow"
          element={
            <ProtectedRoute roles={['librarian']}>
              <BorrowPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="return"
          element={
            <ProtectedRoute roles={['librarian']}>
              <ReturnPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="reports"
          element={
            <ProtectedRoute roles={['admin', 'librarian', 'leader']}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="users"
          element={
            <ProtectedRoute roles={['admin']}>
              <UsersPage />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
};

export default App;