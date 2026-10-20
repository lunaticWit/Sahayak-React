'use client';

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Key,
  FileText,
  MapPin,
  ExternalLink,
  Receipt,
  Download,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { formatINR, formatDate, getStatusColor } from '@/lib/utils';
import { OrderStatus } from '@/types';

export default function OrdersPage() {
  const { language, t } = useLanguage();
  const { orders, currentUser, role } = useAuth();

  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<any>(null);

  const displayedOrders = orders.filter((o) => {
    if (activeFilter === 'active') {
      return o.status !== 'delivered' && o.status !== 'completed' && o.status !== 'cancelled';
    }
    if (activeFilter === 'completed') {
      return o.status === 'delivered' || o.status === 'completed';
    }
    return true;
  });

  const stepsList: { key: OrderStatus; label: string }[] = [
    { key: 'pending', label: 'Placed' },
    { key: 'accepted', label: 'Accepted' },
    { key: 'confirmed', label: 'Paid' },
    { key: 'preparing', label: 'Harvesting' },
    { key: 'dispatched', label: 'Dispatched' },
    { key: 'in_transit', label: 'In Transit' },
    { key: 'delivered', label: 'Delivered' },
  ];

  const getStepIndex = (status: OrderStatus) => {
    const idx = stepsList.findIndex((s) => s.key === status);
    return idx >= 0 ? idx : 0;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-agri-dark">
            {t('orders.title')}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Real-time agricultural consignment lifecycle tracking & verified escrow verification
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-gray-200 shadow-sm self-start sm:self-auto">
          {(['all', 'active', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors ${
                activeFilter === f
                  ? 'bg-agri-primary text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {displayedOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 text-xs text-gray-500 space-y-3">
          <Package className="w-10 h-10 text-gray-300 mx-auto" />
          <p className="font-extrabold text-sm text-gray-700">No orders found in this view.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {displayedOrders.map((ord) => {
            const currentStepIdx = getStepIndex(ord.status);
            const statusColors = getStatusColor(ord.status);

            return (
              <div
                key={ord.id}
                className="bg-white rounded-3xl p-6 shadow-agri-sm border border-gray-200 space-y-5 hover:shadow-agri-md transition-shadow"
              >
                {/* Top Details & OTP */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-gray-900">{ord.order_number}</span>
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${statusColors.bg} ${statusColors.text} ${statusColors.border}`}
                      >
                        {ord.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Placed on {formatDate(ord.created_at)} • Escrow: <strong>Captured</strong>
                    </p>
                  </div>

                  {/* Delivery Verification OTP */}
                  <div className="flex items-center gap-3">
                    {ord.delivery_otp && (
                      <div className="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-2xl flex items-center gap-2">
                        <Key className="w-4 h-4 text-amber-700" />
                        <div>
                          <span className="text-[9px] font-bold text-amber-800 uppercase block">
                            Delivery OTP
                          </span>
                          <span className="text-sm font-black text-amber-900 tracking-widest">
                            {ord.delivery_otp}
                          </span>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => setSelectedReceiptOrder(ord)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-bold text-gray-700 transition-colors"
                    >
                      <Receipt className="w-3.5 h-3.5 text-gray-500" />
                      <span>{t('orders.downloadReceipt')}</span>
                    </button>
                  </div>
                </div>

                {/* Visual Step Progression Bar */}
                <div className="py-2 overflow-x-auto no-scrollbar">
                  <div className="min-w-[540px] flex items-center justify-between relative">
                    <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-gray-200 -z-0" />
                    <div
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-agri-primary -z-0 transition-all duration-500"
                      style={{ width: `${(currentStepIdx / (stepsList.length - 1)) * 100}%` }}
                    />

                    {stepsList.map((step, sIdx) => {
                      const isPast = sIdx <= currentStepIdx;
                      const isCurrent = sIdx === currentStepIdx;

                      return (
                        <div key={step.key} className="flex flex-col items-center relative z-10">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-extrabold transition-all ${
                              isPast
                                ? 'bg-agri-primary text-white ring-4 ring-agri-subtle'
                                : 'bg-white border-2 border-gray-300 text-gray-400'
                            }`}
                          >
                            {isPast ? <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" /> : sIdx + 1}
                          </div>
                          <span
                            className={`text-[10px] mt-1.5 font-bold whitespace-nowrap ${
                              isCurrent
                                ? 'text-agri-primary font-black'
                                : isPast
                                ? 'text-gray-700'
                                : 'text-gray-400'
                            }`}
                          >
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Consignment Item & Value Details */}
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200/60 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-gray-500 block">Produce Consignment</span>
                    <strong className="text-sm font-extrabold text-gray-900">
                      {language === 'hi' ? ord.crop_name_hi : ord.crop_name_en} ({ord.quantity_kg} kg)
                    </strong>
                    <span className="text-[11px] text-gray-500 block">{ord.variety}</span>
                  </div>

                  <div>
                    <span className="text-gray-500 block">Farmer / Collective</span>
                    <strong className="text-xs font-bold text-agri-primary">{ord.farmer_name}</strong>
                    <span className="text-[11px] text-gray-500 block">{ord.fpo_name}</span>
                  </div>

                  <div>
                    <span className="text-gray-500 block">Consolidated Logistics</span>
                    <Link
                      to="/logistics"
                      className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1 mt-0.5"
                    >
                      <Truck className="w-3.5 h-3.5 text-blue-600" />
                      <span>Route #12 (Live)</span>
                    </Link>
                  </div>

                  <div className="text-right">
                    <span className="text-gray-500 block">Total Amount</span>
                    <strong className="text-base font-black text-agri-dark">
                      {formatINR(ord.total_amount)}
                    </strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tax Invoice Receipt Modal */}
      {selectedReceiptOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-agri-primary" />
                <h3 className="font-extrabold text-base text-gray-900">Tax Invoice & Delivery Memo</h3>
              </div>
              <button
                onClick={() => setSelectedReceiptOrder(null)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-gray-700">
              <div className="flex justify-between">
                <span className="text-gray-500">Invoice Number:</span>
                <strong className="font-mono font-bold text-gray-900">INV-SHK-{selectedReceiptOrder.order_number}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date:</span>
                <span>{formatDate(selectedReceiptOrder.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Buyer:</span>
                <span className="font-semibold">{selectedReceiptOrder.buyer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Farmer FPO:</span>
                <span className="font-semibold">{selectedReceiptOrder.farmer_name}</span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between">
                <span>{selectedReceiptOrder.crop_name_en} ({selectedReceiptOrder.quantity_kg} kg @ ₹{selectedReceiptOrder.unit_price}/kg):</span>
                <span>₹{(selectedReceiptOrder.quantity_kg * selectedReceiptOrder.unit_price).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Consolidated Freight Fee:</span>
                <span>₹{selectedReceiptOrder.delivery_fee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Platform Maintenance Fee (1.5%):</span>
                <span>₹{selectedReceiptOrder.platform_fee.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between text-sm font-extrabold text-agri-dark">
                <span>Total Amount Paid:</span>
                <span className="text-agri-accent">{formatINR(selectedReceiptOrder.total_amount)}</span>
              </div>
            </div>

            <button
              onClick={() => {
                alert('Tax Invoice PDF downloaded successfully.');
                setSelectedReceiptOrder(null);
              }}
              className="w-full py-3 bg-agri-primary hover:bg-agri-dark text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Signed GST Receipt (PDF)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
