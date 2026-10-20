'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import { MANDI_PRICES } from '@/lib/mockData';
import { useLanguage } from '@/context/LanguageContext';

export default function MandiTicker() {
  const { language } = useLanguage();

  return (
    <div className="bg-agri-primary text-white text-xs border-b border-agri-primary/40 overflow-hidden py-2 px-4 shadow-inner">
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-agri-accent shrink-0 bg-agri-dark/60 px-2 py-0.5 rounded border border-agri-accent/20">
          <Info className="w-3.5 h-3.5" />
          <span>AGMARKNET MANDI FEED</span>
        </div>

        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar py-0.5 whitespace-nowrap">
          {MANDI_PRICES.map((m) => {
            const isUp = m.trend === 'up';
            const isDown = m.trend === 'down';
            return (
              <div key={m.id} className="inline-flex items-center gap-2 text-xs font-medium">
                <span className="font-semibold text-gray-100">{m.commodity}</span>
                <span className="text-gray-300 text-[11px]">({m.market_name})</span>
                <span className="font-bold text-white">₹{m.modal_price_per_kg}/kg</span>
                {isUp && (
                  <span className="inline-flex items-center text-emerald-300 font-semibold text-[11px]">
                    <TrendingUp className="w-3 h-3 mr-0.5" />+{m.change_percent}%
                  </span>
                )}
                {isDown && (
                  <span className="inline-flex items-center text-red-300 font-semibold text-[11px]">
                    <TrendingDown className="w-3 h-3 mr-0.5" />{m.change_percent}%
                  </span>
                )}
                {!isUp && !isDown && (
                  <span className="inline-flex items-center text-gray-300 text-[11px]">
                    <Minus className="w-3 h-3 mr-0.5" />0.0%
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
