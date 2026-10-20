import type { ReactNode } from 'react';
import { LanguageProvider } from '@/context/LanguageContext';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import MandiTicker from '@/components/MandiTicker';
import BottomNav from '@/components/BottomNav';

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen bg-agri-background text-agri-dark flex flex-col antialiased">
            <Navbar />
            <MandiTicker />
            <main className="flex-1 pb-20 lg:pb-10">{children}</main>
            <BottomNav />
          </div>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
