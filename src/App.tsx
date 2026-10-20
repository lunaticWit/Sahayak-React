import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import RootLayout from '@/app/layout';
import HomePage from '@/app/page';
import AdminPage from '@/app/admin/page';
import BuyerPage from '@/app/buyer/page';
import FarmerPage from '@/app/farmer/page';
import InsightsPage from '@/app/insights/page';
import LogisticsPage from '@/app/logistics/page';
import MarketplacePage from '@/app/marketplace/page';
import OrdersPage from '@/app/orders/page';
import ProfilePage from '@/app/profile/page';

export default function App() {
  return (
    <BrowserRouter>
      <RootLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/buyer" element={<BuyerPage />} />
          <Route path="/farmer" element={<FarmerPage />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="/logistics" element={<LogisticsPage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </RootLayout>
    </BrowserRouter>
  );
}