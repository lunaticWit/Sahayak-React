'use client';

import React, { useState } from 'react';
import { X, Check, Building2, Calendar, MapPin, DollarSign, Package } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { INITIAL_CROPS } from '@/lib/mockData';

interface RequirementModalProps {
  onClose: () => void;
}

export default function RequirementModal({ onClose }: RequirementModalProps) {
  const { language, t } = useLanguage();
  const { addRequirement, currentUser, buyerProfile } = useAuth();

  const [selectedCropId, setSelectedCropId] = useState(INITIAL_CROPS[0].id);
  const [variety, setVariety] = useState('Hybrid Red Grade A');
  const [quantityKg, setQuantityKg] = useState(800);
  const [maxPricePerKg, setMaxPricePerKg] = useState(30);
  const [requiredDate, setRequiredDate] = useState(
    new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [address, setAddress] = useState(
    buyerProfile?.delivery_address || 'Plot 44, APMC Market Sector 19, Vashi, Navi Mumbai'
  );
  const [isSuccess, setIsSuccess] = useState(false);

  const selectedCrop = INITIAL_CROPS.find((c) => c.id === selectedCropId) || INITIAL_CROPS[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    addRequirement({
      buyer_id: currentUser.id,
      buyer_name: currentUser.full_name,
      buyer_type: buyerProfile?.buyer_type || 'Retail Supermarket Chain',
      crop_id: selectedCrop.id,
      crop_name: selectedCrop.name_en,
      variety_preference: variety,
      quantity_requested_kg: Number(quantityKg),
      max_price_per_kg: Number(maxPricePerKg),
      required_by_date: requiredDate,
      delivery_address: address,
      delivery_lat: buyerProfile?.latitude || 19.0760,
      delivery_lng: buyerProfile?.longitude || 73.0083,
      status: 'open',
    });

    setIsSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="bg-agri-dark text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-agri-accent flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">{t('buyer.postRequirement')}</h3>
              <p className="text-[11px] text-gray-300">
                {language === 'hi' ? 'थोक मांग दर्ज करें और तुरंत FPO मैच पाएं' : 'Broadcast demand to verified FPOs'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/20 text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <h4 className="text-xl font-extrabold text-gray-900">
              {language === 'hi' ? 'मांग सफलतापूर्वक दर्ज हुई!' : 'Requirement Posted Successfully!'}
            </h4>
            <p className="text-sm text-gray-600">
              {language === 'hi'
                ? 'एआई ने 3 निकटवर्ती किसान एफपीओ के साथ 94% मैच पाया है।'
                : 'AI Matching has paired 3 nearby FPOs with an average 94% match score.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                {t('listingForm.cropLabel')}
              </label>
              <select
                value={selectedCropId}
                onChange={(e) => setSelectedCropId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-agri-primary focus:outline-none"
              >
                {INITIAL_CROPS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {language === 'hi' ? c.name_hi : c.name_en} ({c.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                {t('listingForm.varietyLabel')}
              </label>
              <input
                type="text"
                required
                value={variety}
                onChange={(e) => setVariety(e.target.value)}
                placeholder="e.g. Hybrid Red Grade A"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-agri-primary focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  {t('buyer.orderVolume')} (kg)
                </label>
                <input
                  type="number"
                  min={50}
                  required
                  value={quantityKg}
                  onChange={(e) => setQuantityKg(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-bold focus:ring-2 focus:ring-agri-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  {t('buyer.maxBudget')} (₹/kg)
                </label>
                <input
                  type="number"
                  min={1}
                  step="0.5"
                  required
                  value={maxPricePerKg}
                  onChange={(e) => setMaxPricePerKg(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-bold focus:ring-2 focus:ring-agri-primary focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                {t('buyer.requiredBy')}
              </label>
              <input
                type="date"
                required
                value={requiredDate}
                onChange={(e) => setRequiredDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-agri-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Delivery Location / Warehouse Depot
              </label>
              <textarea
                rows={2}
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-agri-primary focus:outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 bg-agri-primary hover:bg-agri-dark text-white rounded-xl text-sm font-extrabold flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <span>Find Matching FPOs & Farmers</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
