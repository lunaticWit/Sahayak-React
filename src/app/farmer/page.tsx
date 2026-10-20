'use client';

import React, { useState } from 'react';
import {
  Sprout,
  Package,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Plus,
  CheckCircle2,
  XCircle,
  Truck,
  ShieldCheck,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import CropListingModal from '@/components/CropListingModal';
import { formatINR, formatDate, getStatusColor } from '@/lib/utils';
import { MANDI_PRICES } from '@/lib/mockData';

export default function FarmerDashboard() {
  const { language, t } = useLanguage();
  const { currentUser, farmerProfile, listings, orders, updateOrderStatus } = useAuth();

  const [isListingModalOpen, setIsListingModalOpen] = useState(false);

  // Farmer's own listings & orders
  const myListings = listings.filter((l) => l.farmer_id === currentUser.id);
  const myOrders = orders.filter((o) => o.farmer_id === currentUser.id);

  const activeListingsCount = myListings.filter((l) => l.status === 'active').length;
  const pendingOrdersCount = myOrders.filter((o) => o.status === 'pending').length;
  const totalEarnings = myOrders
    .filter((o) => o.status !== 'cancelled' && o.status !== 'rejected')
    .reduce((sum, o) => sum + o.total_amount, 0);

  const tomatoMandi = MANDI_PRICES.find((m) => m.commodity === 'Tomato');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-agri-accent uppercase tracking-wider">
              {t('farmer.dashboardTitle')}
            </span>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              Verified FPO Member
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-agri-dark mt-1">
            {t('farmer.welcomeBack')}, {currentUser.full_name}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            {farmerProfile?.farm_name} • {farmerProfile?.fpo_name} ({farmerProfile?.district}, {farmerProfile?.state})
          </p>
        </div>

        <button
          onClick={() => setIsListingModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-agri-primary hover:bg-agri-dark text-white font-extrabold text-xs sm:text-sm shadow-md transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>{t('farmer.listNewProduce')}</span>
        </button>
      </div>

      {/* Today's Overview Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-agri-sm">
          <div className="w-9 h-9 rounded-xl bg-agri-subtle text-agri-primary flex items-center justify-center mb-3">
            <Sprout className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
            {t('farmer.activeListings')}
          </span>
          <p className="text-2xl font-black text-agri-dark mt-1">{activeListingsCount}</p>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1 inline-block">
            Ready for Buyer Sourcing
          </span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-agri-sm">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-agri-accent flex items-center justify-center mb-3">
            <Package className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
            {t('farmer.pendingOrders')}
          </span>
          <p className="text-2xl font-black text-agri-accent mt-1">{pendingOrdersCount}</p>
          <span className="text-[11px] text-gray-500 font-medium mt-1 inline-block">
            Requires Confirmation
          </span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-agri-sm">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
            <DollarSign className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
            {t('farmer.expectedEarnings')}
          </span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{formatINR(totalEarnings)}</p>
          <span className="text-[11px] text-gray-500 font-medium mt-1 inline-block">
            Escrow Verified via Razorpay
          </span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-agri-sm">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
            {t('farmer.mandiAlert')}
          </span>
          <p className="text-xl font-black text-gray-900 mt-1">₹{tomatoMandi?.modal_price_per_kg || 25}/kg</p>
          <span className="text-[11px] text-emerald-600 font-bold mt-1 inline-block">
            Lasalgaon Mandi Modal Rate
          </span>
        </div>
      </div>

      {/* Demand Intelligence Alert & Recommended Action */}
      <div className="bg-gradient-to-r from-amber-500/10 via-agri-subtle to-emerald-500/10 rounded-3xl p-6 border border-agri-primary/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-agri-primary text-white flex items-center justify-center shrink-0 shadow-md">
            <Sparkles className="w-5 h-5 text-agri-accent" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-agri-accent uppercase tracking-wider">
                {t('farmer.demandAlertTitle')}
              </span>
              <span className="text-[10px] bg-agri-primary text-white font-bold px-2 py-0.5 rounded-full">
                AI Confidence: 92%
              </span>
            </div>
            <h3 className="text-base font-extrabold text-gray-900 mt-0.5">
              {language === 'hi'
                ? 'मुंबई व ठाणे क्षेत्र में आगामी 7 दिनों में टमाटर की मांग में +14.5% वृद्धि का अनुमान है।'
                : 'Tomato demand surge detected in Mumbai & Thane corridor (+14.5% over next 7 days).'}
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              <strong className="text-agri-dark">{t('farmer.recommendedAction')}:</strong>{' '}
              {language === 'hi'
                ? 'अतिरिक्त 150-200 किग्रा टमाटर ₹28/किग्रा पर लिस्ट करें ताकि थोक खरीदार तुरंत आर्डर बुक कर सकें।'
                : 'Consider listing an additional 150-200 kg at ₹28.00/kg to capture peak supermarket procurement.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsListingModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-agri-primary hover:bg-agri-dark text-white font-bold text-xs shrink-0 transition-colors shadow-sm"
        >
          {t('farmer.listNewProduce')}
        </button>
      </div>

      {/* Received Orders Table / Cards */}
      <div className="bg-white rounded-3xl p-6 shadow-agri-sm border border-gray-200/80 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-gray-900">{t('farmer.receivedOrders')}</h3>
          <span className="text-xs font-bold text-gray-500">{myOrders.length} Orders</span>
        </div>

        {myOrders.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-500">
            No incoming orders at the moment.
          </div>
        ) : (
          <div className="space-y-3">
            {myOrders.map((ord) => {
              const statusStyle = getStatusColor(ord.status);
              return (
                <div
                  key={ord.id}
                  className="p-4 rounded-2xl border border-gray-200 bg-gray-50/70 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs text-gray-900">
                        {ord.order_number}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                      >
                        {ord.status.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-sm font-extrabold text-gray-900">
                      {language === 'hi' ? ord.crop_name_hi : ord.crop_name_en} ({ord.variety}) • {ord.quantity_kg} kg
                    </p>

                    <p className="text-xs text-gray-600">
                      Buyer: <strong>{ord.buyer_name}</strong> • {formatDate(ord.created_at)}
                    </p>
                  </div>

                  {/* Order Actions */}
                  <div className="flex items-center gap-2 self-end md:self-auto">
                    {ord.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateOrderStatus(ord.id, 'accepted')}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-sm"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{t('farmer.acceptOrder')}</span>
                        </button>
                        <button
                          onClick={() => updateOrderStatus(ord.id, 'rejected')}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>{t('farmer.rejectOrder')}</span>
                        </button>
                      </>
                    )}

                    {ord.status === 'confirmed' && (
                      <button
                        onClick={() => updateOrderStatus(ord.id, 'preparing')}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-agri-primary hover:bg-agri-dark text-white text-xs font-bold transition-colors shadow-sm"
                      >
                        <Sprout className="w-3.5 h-3.5" />
                        <span>Harvest & Pack</span>
                      </button>
                    )}

                    {ord.status === 'preparing' && (
                      <button
                        onClick={() => updateOrderStatus(ord.id, 'dispatched')}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors shadow-sm"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>{t('farmer.markReady')}</span>
                      </button>
                    )}

                    <div className="text-right pl-3 border-l border-gray-200">
                      <span className="text-[10px] text-gray-400 font-bold block">Order Value</span>
                      <span className="text-sm font-black text-agri-dark">{formatINR(ord.total_amount)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* My Active Listings Catalog */}
      <div className="bg-white rounded-3xl p-6 shadow-agri-sm border border-gray-200/80 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-gray-900">{t('farmer.myListings')}</h3>
          <span className="text-xs font-bold text-gray-500">{myListings.length} Listed</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {myListings.map((l) => (
            <div
              key={l.id}
              className="p-4 rounded-2xl border border-gray-200 bg-white flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-agri-accent uppercase tracking-wider">
                    {l.variety}
                  </span>
                  <span className="text-[10px] font-extrabold bg-agri-subtle text-agri-primary px-2 py-0.5 rounded-full">
                    {l.grade}
                  </span>
                </div>
                <h4 className="font-extrabold text-base text-gray-900 mt-1">
                  {language === 'hi' ? l.crop_name_hi : l.crop_name_en}
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  Available: <strong>{l.quantity_available_kg} kg</strong> • Min: {l.minimum_order_kg} kg
                </p>
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-lg font-black text-agri-dark">₹{l.price_per_kg.toFixed(2)}</span>
                  <span className="text-xs text-gray-500">/kg</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg">
                  Active
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Listing Creation Modal */}
      {isListingModalOpen && (
        <CropListingModal onClose={() => setIsListingModalOpen(false)} />
      )}
    </div>
  );
}
