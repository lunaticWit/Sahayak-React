'use client';

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sprout,
  Languages,
  Mic,
  ShoppingCart,
  UserCheck,
  Wifi,
  WifiOff,
  Menu,
  X,
  Truck,
  TrendingUp,
  Store,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { UserRole } from '@/types';
import VoiceAssistantModal from '@/components/VoiceAssistantModal';

export default function Navbar() {
  const { pathname } = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const { role, setRole, currentUser } = useAuth();
  const { cart } = useCart();

  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const roles: { key: UserRole; label: string; desc: string }[] = [
    { key: 'farmer', label: 'Farmer / FPO (Ramesh)', desc: 'Nashik Organic Vegetable FPO' },
    { key: 'bulk_buyer', label: 'Bulk Buyer (FreshMart)', desc: 'Retail Supermarket Mumbai Hub' },
    { key: 'consumer', label: 'Consumer (Priya)', desc: 'Direct Household Buyer Pune' },
    { key: 'logistics_driver', label: 'Logistics Fleet (Suresh)', desc: 'Sahayak Commercial EV Fleet' },
    { key: 'admin', label: 'Platform Admin', desc: 'Operations & RLS Governance' },
  ];

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantityKg, 0);

  return (
    <>
      <header className="sticky top-0 z-40 bg-agri-dark text-white shadow-agri-md border-b border-agri-primary/30 backdrop-blur">
        {/* Offline Banner if disconnected */}
        {!isOnline && (
          <div className="bg-amber-600 text-white text-xs font-semibold px-4 py-1.5 flex items-center justify-center gap-2">
            <WifiOff className="w-3.5 h-3.5" />
            <span>{t('app.offlineNotice')}</span>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-agri-medium to-agri-light flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <Sprout className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1.5">
                  सहायक <span className="text-agri-accent text-sm font-semibold tracking-normal font-sans">Sahayak</span>
                </span>
                <span className="text-[10px] text-gray-300 font-medium tracking-wide uppercase">
                  SIH 2026 PS 33
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link
                to="/marketplace"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === '/marketplace'
                    ? 'bg-agri-primary text-white shadow-sm'
                    : 'text-gray-200 hover:text-white hover:bg-agri-primary/40'
                }`}
              >
                {t('nav.marketplace')}
              </Link>
              <Link
                to="/farmer"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === '/farmer'
                    ? 'bg-agri-primary text-white shadow-sm'
                    : 'text-gray-200 hover:text-white hover:bg-agri-primary/40'
                }`}
              >
                {t('nav.farmer')}
              </Link>
              <Link
                to="/buyer"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === '/buyer'
                    ? 'bg-agri-primary text-white shadow-sm'
                    : 'text-gray-200 hover:text-white hover:bg-agri-primary/40'
                }`}
              >
                {t('nav.buyer')}
              </Link>
              <Link
                to="/logistics"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === '/logistics'
                    ? 'bg-agri-primary text-white shadow-sm'
                    : 'text-gray-200 hover:text-white hover:bg-agri-primary/40'
                }`}
              >
                {t('nav.logistics')}
              </Link>
              <Link
                to="/insights"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === '/insights'
                    ? 'bg-agri-primary text-white shadow-sm'
                    : 'text-gray-200 hover:text-white hover:bg-agri-primary/40'
                }`}
              >
                {t('nav.insights')}
              </Link>
              <Link
                to="/orders"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === '/orders'
                    ? 'bg-agri-primary text-white shadow-sm'
                    : 'text-gray-200 hover:text-white hover:bg-agri-primary/40'
                }`}
              >
                {t('nav.orders')}
              </Link>
            </nav>

            {/* Actions: Persona Switcher, Voice, Language, Cart */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Persona / Role Switcher for SIH Judging Demo */}
              <div className="relative">
                <button
                  onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-agri-primary/70 hover:bg-agri-primary border border-agri-light/30 text-xs font-medium text-white transition-all shadow-sm"
                  title="Switch Demo Persona"
                >
                  <UserCheck className="w-3.5 h-3.5 text-agri-accent" />
                  <span className="hidden md:inline font-semibold">
                    {roles.find((r) => r.key === role)?.label.split('(')[0]}
                  </span>
                  <span className="md:hidden capitalize font-semibold">{role}</span>
                </button>

                {isRoleDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white text-gray-900 shadow-2xl border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-3 py-1.5 border-b border-gray-100">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        {t('app.switchRole')}
                      </p>
                    </div>
                    {roles.map((r) => (
                      <button
                        key={r.key}
                        onClick={() => {
                          setRole(r.key);
                          setIsRoleDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex flex-col transition-colors ${
                          role === r.key
                            ? 'bg-agri-subtle text-agri-dark font-bold'
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <span className="font-semibold text-sm">{r.label}</span>
                        <span className="text-[11px] text-gray-500 font-normal">{r.desc}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Kisan Voice Assistant Trigger */}
              <button
                onClick={() => setIsVoiceOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-agri-accent to-amber-600 hover:from-amber-600 hover:to-agri-accent text-white text-xs font-bold shadow-md hover:scale-105 transition-all"
                title="Kisan Sahayak Voice Assistant"
              >
                <Mic className="w-4 h-4 animate-pulse" />
                <span className="hidden sm:inline">{t('voice.buttonLabel')}</span>
              </button>

              {/* Language Selector (EN / HI) */}
              <button
                onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-white border border-white/10 transition-colors"
                title="Toggle Language"
              >
                <Languages className="w-3.5 h-3.5 text-agri-accent" />
                <span>{language === 'en' ? 'हिन्दी' : 'English'}</span>
              </button>

              {/* Shopping Cart Button */}
              <Link
                to="/marketplace?cart=open"
                className="relative p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="View Basket"
              >
                <ShoppingCart className="w-4 h-4" />
                {totalCartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-agri-accent text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                    {cart.length}
                  </span>
                )}
              </Link>

              {/* Mobile menu trigger */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-agri-dark border-t border-agri-primary/40 px-4 pt-2 pb-4 space-y-1">
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-medium text-gray-200 hover:text-white hover:bg-agri-primary/50"
            >
              {t('nav.home')}
            </Link>
            <Link
              to="/marketplace"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-medium text-gray-200 hover:text-white hover:bg-agri-primary/50"
            >
              {t('nav.marketplace')}
            </Link>
            <Link
              to="/farmer"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-medium text-gray-200 hover:text-white hover:bg-agri-primary/50"
            >
              {t('nav.farmer')}
            </Link>
            <Link
              to="/buyer"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-medium text-gray-200 hover:text-white hover:bg-agri-primary/50"
            >
              {t('nav.buyer')}
            </Link>
            <Link
              to="/logistics"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-medium text-gray-200 hover:text-white hover:bg-agri-primary/50"
            >
              {t('nav.logistics')}
            </Link>
            <Link
              to="/insights"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-medium text-gray-200 hover:text-white hover:bg-agri-primary/50"
            >
              {t('nav.insights')}
            </Link>
            <Link
              to="/orders"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-medium text-gray-200 hover:text-white hover:bg-agri-primary/50"
            >
              {t('nav.orders')}
            </Link>
            <Link
              to="/admin"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-medium text-gray-200 hover:text-white hover:bg-agri-primary/50"
            >
              {t('nav.admin')}
            </Link>
          </div>
        )}
      </header>

      {/* Voice Assistant Modal */}
      {isVoiceOpen && <VoiceAssistantModal onClose={() => setIsVoiceOpen(false)} />}
    </>
  );
}
