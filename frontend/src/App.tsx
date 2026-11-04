import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { ErrorBoundary } from './components';
import { NotificationProvider } from './contexts/NotificationContext';
import { useNotificationContext } from './contexts/useNotificationContext';
import { RequireAuthRoute } from './auth/AuthGate';
import { RequireAdmin } from './auth/RequireAdmin';
import { RequireCanPlaceOrder } from './auth/RequireCanPlaceOrder';
import { Home, NewOrder, OrderHistory, OrderDetails, AdminCoupons, Privacy } from './pages';

/**
 * Component that clears notifications on route change
 */
function RouteChangeHandler() {
  const location = useLocation();
  const { clearNotification } = useNotificationContext();

  useEffect(() => {
    clearNotification();
  }, [location.pathname, clearNotification]);

  return null;
}

/**
 * Main application component with routing configuration
 * Wrapped in ErrorBoundary for graceful error handling
 * NotificationProvider provides global notification state
 */
export function App() {
  return (
    <ErrorBoundary>
      <NotificationProvider>
        <BrowserRouter>
          <RouteChangeHandler />
          <Routes>
            {/* Public: no login required */}
            <Route path="/privacy" element={<Privacy />} />
            <Route element={<RequireAuthRoute />}>
              <Route path="/" element={<Home />} />
              <Route path="/new-order" element={<RequireCanPlaceOrder><NewOrder /></RequireCanPlaceOrder>} />
              <Route path="/order-history" element={<OrderHistory />} />
              <Route path="/order-details/:orderNumber" element={<OrderDetails />} />
              <Route path="/admin-coupons" element={<RequireAdmin><AdminCoupons /></RequireAdmin>} />
            </Route>
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </ErrorBoundary>
  );
}
