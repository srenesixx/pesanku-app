import { useState } from 'react';
import { authApi } from './services/api.js';
import AdminLayout from './components/AdminLayout.jsx';
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

  function handleLoginSuccess(nextSession) {
    setSession(nextSession);
    setView('admin');
    setAdminTab('dashboard');
  }

  function handleLogout() {
    authApi.logout();
    setSession(null);
    setView('storefront');
  }

  if (view === 'login') {
    return <LoginPage onSuccess={handleLoginSuccess} onBack={() => setView('storefront')} />;
  }

  if (view === 'admin' && session) {
    return (
      <AdminLayout
        activeTab={adminTab}
        onSelectTab={setAdminTab}
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
      onOpenLogin={() => setView(session ? 'admin' : 'login')}
    />
  );
}
