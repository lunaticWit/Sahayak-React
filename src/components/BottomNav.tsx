'use client';

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Store, UserCheck, Package, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';

export default function BottomNav() {
  const { pathname } = useLocation();
  const { t } = useLanguage();
  const { role } = useAuth();

  const deskUrl = role === 'farmer' || role === 'fpo' ? '/farmer' : '/buyer';
  const deskLabel = role === 'farmer' || role === 'fpo' ? t('nav.farmer') : t('nav.buyer');

  const navItems = [
    { href: '/', label: t('nav.home'), icon: Home },
    { href: '/marketplace', label: t('nav.marketplace'), icon: Store },
    { href: deskUrl, label: deskLabel, icon: UserCheck },
    { href: '/orders', label: t('nav.orders'), icon: Package },
    { href: '/insights', label: t('nav.insights'), icon: TrendingUp },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-2xl py-1.5 px-2">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors min-w-[64px] ${
                isActive
                  ? 'text-agri-primary font-bold bg-agri-subtle/60'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-agri-primary stroke-[2.5]' : ''}`} />
              <span className="text-[10px] mt-0.5 tracking-tight font-medium truncate max-w-[68px]">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
