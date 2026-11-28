import { useCallback, useEffect, useState } from 'react';
import { authApi } from './services/api.js';
import { AdminLayout } from './components/organisms/index.js';
import CustomerOrderPage from './pages/CustomerOrderPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import MenuManagementPage from './pages/MenuManagementPage.jsx';
import OrdersPage from './pages/OrdersPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';

export default function App() {
  const [session, setSession] = useState(() => authApi.getSession());
  const [view, setView] = useState(() => (authApi.getSession() ? 'admin' : 'storefront'));
  const [adminTab, setAdminTab] = useState('dashboard');

  const handleLogout = useCallback(() => {
    authApi.logout();
    setSession(null);
    setView('storefront');
  }, []);

  useEffect(() => {
    if (!session) return undefined;
    const validSession = authApi.getSession();
    if (!validSession) {
      handleLogout();
      return undefined;
    }
    const remainingMs = Math.max((validSession.expiresAt || 0) - Date.now(), 0);
    const timerId = setTimeout(() => {
      handleLogout();
    }, remainingMs);
    return () => clearTimeout(timerId);
  }, [session, handleLogout]);

  function handleLoginSuccess(nextSession) {
    setSession(nextSession);
    setView('admin');
    setAdminTab('dashboard');
  }

  function handleSelectTab(nextTab) {
    const activeSession = authApi.getSession();
    if (!activeSession) {
      handleLogout();
      return;
    }
    setSession(activeSession);
    setAdminTab(nextTab);
  }

  if (view === 'login') {
    return <LoginPage onSuccess={handleLoginSuccess} onBack={() => setView('storefront')} />;
  }

  if (view === 'admin' && session) {
    return (
      <AdminLayout
        activeTab={adminTab}
        onSelectTab={handleSelectTab}
        user={session.user}
        onLogout={handleLogout}
        onOpenStorefront={() => setView('storefront')}
      >
        {adminTab === 'dashboard' && <DashboardPage />}
        {adminTab === 'orders' && <OrdersPage />}
        {adminTab === 'menus' && <MenuManagementPage />}
        {adminTab === 'reports' && <ReportsPage />}
      </AdminLayout>
    );
  }

  return (
    <CustomerOrderPage
      onOpenLogin={() => {
        const activeSession = authApi.getSession();
        setSession(activeSession);
        setView(activeSession ? 'admin' : 'login');
      }}
    />
  );
}
