'use client';

import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  Languages,
  Bell,
  HardDrive,
  CheckCircle2,
  Building2,
  Sprout,
  Save,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';

export default function ProfilePage() {
  const { language, setLanguage, t } = useLanguage();
  const { currentUser, farmerProfile, buyerProfile, role } = useAuth();

  const [notifications, setNotifications] = useState({
    priceAlerts: true,
    buyerMatches: true,
    demandInsights: true,
    orderUpdates: true,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-agri-dark">
          {t('nav.profile')} & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
          Manage farm credentials, regional language preferences, and offline caching sync
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* User Card */}
        <div className="bg-white rounded-3xl p-6 shadow-agri-sm border border-gray-200 flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-agri-primary text-white flex items-center justify-center font-black text-xl shadow-md">
            {currentUser.full_name.charAt(0)}
          </div>
          <div className="space-y-1 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-lg font-extrabold text-gray-900">{currentUser.full_name}</h2>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Verified Sahayak Member
              </span>
            </div>
            <p className="text-xs text-gray-500 font-mono">{currentUser.phone}</p>
            <p className="text-xs text-agri-primary font-semibold capitalize">
              Active Role: <strong>{role.replace('_', ' ')}</strong>
            </p>
          </div>
        </div>

        {/* Farm / Business Information */}
        <div className="bg-white rounded-3xl p-6 shadow-agri-sm border border-gray-200 space-y-4">
          <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-2">
            {role === 'farmer' || role === 'fpo' ? (
              <Sprout className="w-4 h-4 text-emerald-600" />
            ) : (
              <Building2 className="w-4 h-4 text-blue-600" />
            )}
            <span>
              {role === 'farmer' || role === 'fpo' ? 'Farm & Collective Details' : 'Enterprise Sourcing Profile'}
            </span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {farmerProfile && (
              <>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Farm Name</label>
                  <input
                    type="text"
                    defaultValue={farmerProfile.farm_name}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-gray-900 font-semibold focus:outline-none focus:ring-1 focus:ring-agri-primary"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Associated FPO Collective</label>
                  <input
                    type="text"
                    defaultValue={farmerProfile.fpo_name}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-gray-900 font-semibold focus:outline-none focus:ring-1 focus:ring-agri-primary"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Cultivated Land (Acres)</label>
                  <input
                    type="number"
                    defaultValue={farmerProfile.farm_size_acres}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-gray-900 font-semibold focus:outline-none focus:ring-1 focus:ring-agri-primary"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">State & District</label>
                  <input
                    type="text"
                    defaultValue={`${farmerProfile.district}, ${farmerProfile.state}`}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-gray-900 font-semibold focus:outline-none focus:ring-1 focus:ring-agri-primary"
                  />
                </div>
              </>
            )}

            {buyerProfile && (
              <>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Organization Name</label>
                  <input
                    type="text"
                    defaultValue={buyerProfile.organization_name}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-gray-900 font-semibold focus:outline-none focus:ring-1 focus:ring-agri-primary"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    defaultValue={buyerProfile.gstin}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-gray-900 font-semibold focus:outline-none focus:ring-1 focus:ring-agri-primary"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-gray-700 mb-1">Delivery Depot Address</label>
                  <textarea
                    rows={2}
                    defaultValue={buyerProfile.delivery_address}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-gray-900 text-xs focus:outline-none focus:ring-1 focus:ring-agri-primary"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Language & Regional Settings */}
        <div className="bg-white rounded-3xl p-6 shadow-agri-sm border border-gray-200 space-y-4">
          <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <Languages className="w-4 h-4 text-agri-accent" />
            <span>Language & Localization</span>
          </h3>

          <div className="grid grid-cols-2 gap-3 max-w-sm">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`p-3 rounded-2xl border text-left text-xs font-bold transition-all ${
                language === 'en'
                  ? 'bg-agri-primary text-white border-agri-primary shadow-sm'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="block text-sm">English</span>
              <span className="text-[10px] font-normal opacity-80">Default Global</span>
            </button>

            <button
              type="button"
              onClick={() => setLanguage('hi')}
              className={`p-3 rounded-2xl border text-left text-xs font-bold transition-all ${
                language === 'hi'
                  ? 'bg-agri-primary text-white border-agri-primary shadow-sm'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="block text-sm">हिन्दी (Hindi)</span>
              <span className="text-[10px] font-normal opacity-80">किसान अनुकूल</span>
            </button>
          </div>
        </div>

        {/* Offline Cache & PWA Storage */}
        <div className="bg-white rounded-3xl p-6 shadow-agri-sm border border-gray-200 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-gray-600" />
              <span>Offline PWA Cache Status</span>
            </h3>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Synced
            </span>
          </div>
          <p className="text-xs text-gray-600">
            Latest APMC Mandi rates and local produce listings are cached locally for offline accessibility in rural areas with intermittent connectivity.
          </p>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between pt-2">
          {savedSuccess ? (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              Settings saved successfully!
            </span>
          ) : (
            <div />
          )}

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 bg-agri-primary hover:bg-agri-dark text-white rounded-2xl font-bold text-xs shadow-md transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{t('common.save')}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
