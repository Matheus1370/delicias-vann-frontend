import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/auth.store';
import { lazy, Suspense } from 'react';
import CookieBanner from './components/CookieBanner';
import Layout from './components/Layout';

const Home = lazy(() => import('./pages/Home'));
const Catalog = lazy(() => import('./pages/Catalog'));
const Wizard = lazy(() => import('./pages/Wizard'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Tracking = lazy(() => import('./pages/OrderTracking'));
const History = lazy(() => import('./pages/History'));
const Profile = lazy(() => import('./pages/Profile'));
const Subscriptions = lazy(() => import('./pages/Subscriptions'));
const Legal = lazy(() => import('./pages/Legal'));
const Login = lazy(() => import('./pages/Auth/Login'));
const Register = lazy(() => import('./pages/Auth/Register'));
const AdminDash = lazy(() => import('./pages/admin/Dashboard'));
const AdminOrders = lazy(() => import('./pages/admin/Orders'));
const AdminProd = lazy(() => import('./pages/admin/Production'));
const AdminInv = lazy(() => import('./pages/admin/Inventory'));
const AdminReports = lazy(() => import('./pages/admin/Reports'));
const AdminCoupons = lazy(() => import('./pages/admin/Coupons'));
const AdminBalcao = lazy(() => import('./pages/admin/Balcao'));
const AdminProductionSheet = lazy(() => import('./pages/admin/ProductionSheet'));

const qc = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 60_000 },
    mutations: { retry: 0 },
  },
});

function PrivateRoute({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles?: string[];
}) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function LoadingFallback() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#F6EDE7',
      }}
    >
      <div style={{ fontSize: 48 }}>Delicias da Vann</div>
    </div>
  );
}

const ADMIN_ROLES = ['OPERADOR', 'GERENTE', 'ADMINISTRADOR'];
const GERENTE_ROLES = ['GERENTE', 'ADMINISTRADOR'];

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <Suspense fallback={<LoadingFallback />}>
          <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cardapio" element={<Catalog />} />
            <Route path="/montar" element={<Wizard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Register />} />
            <Route path="/termos" element={<Legal kind="termos" />} />
            <Route path="/privacidade" element={<Legal kind="privacidade" />} />

            <Route
              path="/checkout"
              element={
                <PrivateRoute>
                  <Checkout />
                </PrivateRoute>
              }
            />
            <Route
              path="/pedidos"
              element={
                <PrivateRoute>
                  <History />
                </PrivateRoute>
              }
            />
            <Route
              path="/pedidos/:id"
              element={
                <PrivateRoute>
                  <Tracking />
                </PrivateRoute>
              }
            />
            <Route
              path="/perfil"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path="/assinaturas"
              element={
                <PrivateRoute>
                  <Subscriptions />
                </PrivateRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <PrivateRoute roles={ADMIN_ROLES}>
                  <AdminDash />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/pedidos"
              element={
                <PrivateRoute roles={ADMIN_ROLES}>
                  <AdminOrders />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/pedidos/:id/ficha"
              element={
                <PrivateRoute roles={ADMIN_ROLES}>
                  <AdminProductionSheet />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/producao"
              element={
                <PrivateRoute roles={ADMIN_ROLES}>
                  <AdminProd />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/balcao"
              element={
                <PrivateRoute roles={ADMIN_ROLES}>
                  <AdminBalcao />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/estoque"
              element={
                <PrivateRoute roles={GERENTE_ROLES}>
                  <AdminInv />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/cupons"
              element={
                <PrivateRoute roles={GERENTE_ROLES}>
                  <AdminCoupons />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/relatorios"
              element={
                <PrivateRoute roles={GERENTE_ROLES}>
                  <AdminReports />
                </PrivateRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </Layout>
        </Suspense>

        <CookieBanner />
      </BrowserRouter>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#422716',
            color: '#F6EDE7',
            fontFamily: 'Quicksand',
            fontWeight: 600,
          },
          success: { iconTheme: { primary: '#ED71A2', secondary: '#F6EDE7' } },
          error: { iconTheme: { primary: '#58C2E0', secondary: '#F6EDE7' } },
        }}
      />

      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
