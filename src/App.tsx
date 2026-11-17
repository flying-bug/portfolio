import { lazy, Suspense, useEffect, useState } from 'react';
import { useCv } from './lib/useCv';
import { PublicPage } from './pages/PublicPage';

// Trang admin tách riêng để khách xem CV không phải tải code admin.
const AdminPage = lazy(() => import('./pages/admin/AdminPage'));

function useIsAdminRoute() {
  const check = () => window.location.hash.startsWith('#/admin');
  const [isAdmin, setIsAdmin] = useState(check);
  useEffect(() => {
    const onHash = () => setIsAdmin(check());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  return isAdmin;
}

export default function App() {
  const isAdmin = useIsAdminRoute();
  const { cv, error } = useCv();

  if (isAdmin) {
    return (
      <Suspense fallback={<div className="center-msg">Đang tải trang quản trị…</div>}>
        <AdminPage />
      </Suspense>
    );
  }
  if (error) return <div className="center-msg">Không tải được dữ liệu CV ({error}).</div>;
  if (!cv) return <div className="center-msg">Đang tải…</div>;
  return <PublicPage cv={cv} />;
}
