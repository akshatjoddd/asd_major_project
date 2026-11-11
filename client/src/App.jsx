import { HashRouter, Route, Routes } from 'react-router-dom';
import PublicLayout from './components/PublicLayout';
import Home from './pages/Home';
import Chat from './pages/Chat';
import Ticket from './pages/Ticket';
import Lookup from './pages/Lookup';
import NotFound from './pages/NotFound';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './admin/auth/AuthContext';
import ProtectedRoute from './admin/auth/ProtectedRoute';
import AdminLayout from './admin/AdminLayout';
import Login from './admin/Login';
import Dashboard from './admin/Dashboard';
import Bookings from './admin/Bookings';
import Payments from './admin/Payments';
import Exhibitions from './admin/Exhibitions';
import Shows from './admin/Shows';
import Slots from './admin/Slots';
import Pricing from './admin/Pricing';
import Validate from './admin/Validate';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <HashRouter>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/ticket/:bookingId" element={<Ticket />} />
              <Route path="/lookup" element={<Lookup />} />
              <Route path="*" element={<NotFound />} />
            </Route>

            <Route path="/admin/login" element={<Login />} />

            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="bookings" element={<Bookings />} />
              <Route path="payments" element={<Payments />} />
              <Route path="exhibitions" element={<Exhibitions />} />
              <Route path="shows" element={<Shows />} />
              <Route path="slots" element={<Slots />} />
              <Route path="pricing" element={<Pricing />} />
              <Route path="validate" element={<Validate />} />
            </Route>
          </Routes>
        </HashRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
