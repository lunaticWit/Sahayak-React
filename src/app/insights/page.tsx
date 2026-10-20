'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  Search,
  Calendar,
  Sparkles,
  Info,
  BrainCircuit,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import DemandForecastChart from '@/components/DemandForecastChart';
import { MANDI_PRICES, INITIAL_CROPS } from '@/lib/mockData';
import { generateLocalForecast } from '@/lib/forecasting';
import { formatINR } from '@/lib/utils';

export default function InsightsPage() {
  const { language, t } = useLanguage();

  const [selectedCropName, setSelectedCropName] = useState('Tomato');
  const [selectedDistrict, setSelectedDistrict] = useState('Nashik');
  const [mandiFilterState, setMandiFilterState] = useState('all');
  const [mandiSearch, setMandiSearch] = useState('');

  // Active crop forecast
  const currentPrice = selectedCropName === 'Tomato' ? 28.0 : selectedCropName === 'Wheat' ? 36.0 : 24.5;
  const forecast = generateLocalForecast(selectedCropName, selectedDistrict, currentPrice, 7);

  const filteredMandiPrices = MANDI_PRICES.filter((m) => {
    if (mandiFilterState !== 'all' && m.state.toLowerCase() !== mandiFilterState.toLowerCase()) {
      return false;
    }
    if (
      mandiSearch &&
      !m.commodity.toLowerCase().includes(mandiSearch.toLowerCase()) &&
      !m.market_name.toLowerCase().includes(mandiSearch.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-agri-accent uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            Mandi Benchmark & AI Forecasting Engine
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-agri-dark mt-1">
          {t('insights.title')}
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
          {t('insights.subtitle')}
        </p>
      </div>

      {/* Demand & Price Forecast Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-xl font-extrabold text-agri-dark flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-agri-primary" />
            <span>{t('insights.forecastExplorer')}</span>
          </h2>

          {/* Commodity Selector */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {['Tomato', 'Wheat', 'Onion', 'Potato', 'Basmati Rice', 'Cauliflower'].map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCropName(c)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                  selectedCropName === c
                    ? 'bg-agri-primary text-white shadow-sm'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <DemandForecastChart forecast={forecast} />
      </div>

      {/* Agmarknet Mandi Price Explorer Table */}
      <div className="bg-white rounded-3xl p-6 shadow-agri-sm border border-gray-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <h3 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
              <Info className="w-4 h-4 text-agri-accent" />
              <span>{t('insights.mandiExplorer')}</span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Live Mandi Price discovery powered by official AGMARKNET benchmark feeds (agmarknet.gov.in)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                value={mandiSearch}
                onChange={(e) => setMandiSearch(e.target.value)}
                placeholder="Search market or crop..."
                className="pl-8 pr-3 py-1.5 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-agri-primary"
              />
            </div>

            <select
              value={mandiFilterState}
              onChange={(e) => setMandiFilterState(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 focus:outline-none"
            >
              <option value="all">All States</option>
              <option value="maharashtra">Maharashtra</option>
              <option value="madhya pradesh">Madhya Pradesh</option>
              <option value="karnataka">Karnataka</option>
              <option value="haryana">Haryana</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-gray-400 font-bold uppercase tracking-wider">
                <th className="pb-3 px-3">Commodity</th>
                <th className="pb-3 px-3">Market (APMC)</th>
                <th className="pb-3 px-3">State / District</th>
                <th className="pb-3 px-3 text-right">Modal Rate</th>
                <th className="pb-3 px-3 text-right">Min - Max</th>
                <th className="pb-3 px-3 text-right">Daily Shift</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-800">
              {filteredMandiPrices.map((m) => {
                const isUp = m.trend === 'up';
                const isDown = m.trend === 'down';
                return (
                  <tr key={m.id} className="hover:bg-agri-subtle/40 transition-colors">
                    <td className="py-3 px-3 font-extrabold text-gray-900">{m.commodity}</td>
                    <td className="py-3 px-3 font-semibold text-agri-primary">{m.market_name}</td>
                    <td className="py-3 px-3 text-gray-500">
                      {m.district}, {m.state}
                    </td>
                    <td className="py-3 px-3 text-right font-black text-sm text-agri-dark">
                      ₹{m.modal_price_per_kg.toFixed(2)}/kg
                    </td>
                    <td className="py-3 px-3 text-right text-gray-500">
                      ₹{m.min_price_per_kg} - ₹{m.max_price_per_kg}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {isUp && (
                        <span className="inline-flex items-center text-emerald-600 font-bold">
                          <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />+{m.change_percent}%
                        </span>
                      )}
                      {isDown && (
                        <span className="inline-flex items-center text-red-600 font-bold">
                          <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />{m.change_percent}%
                        </span>
                      )}
                      {!isUp && !isDown && (
                        <span className="inline-flex items-center text-gray-400 font-semibold">
                          <Minus className="w-3.5 h-3.5 mr-0.5" />0.0%
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
