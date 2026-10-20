'use client';

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sprout,
  TrendingUp,
  Truck,
  Users,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import SupplyChainFlow from '@/components/SupplyChainFlow';
import CropCard from '@/components/CropCard';
import RazorpayModal from '@/components/RazorpayModal';
import CropListingModal from '@/components/CropListingModal';
import { CropListing } from '@/types';

export default function HomePage() {
  const { language, t } = useLanguage();
  const { listings, role, setRole } = useAuth();

  const [selectedListingForBuy, setSelectedListingForBuy] = useState<CropListing | null>(null);
  const [isListingModalOpen, setIsListingModalOpen] = useState(false);

  const featuredListings = listings.slice(0, 4);

  return (
    <div className="space-y-10 sm:space-y-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-agri-dark via-agri-primary to-agri-medium text-white p-6 sm:p-12 shadow-2xl border border-agri-primary/30">
        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-agri-accent/20 border border-agri-accent/40 text-amber-300 text-xs font-extrabold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SIH 2026 Problem Statement 33 • Sahayak</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight sm:leading-tight">
            {t('home.heroTitle')}
          </h1>

          <p className="text-sm sm:text-base text-gray-200 leading-relaxed max-w-2xl font-medium">
            {t('home.heroSubtitle')}
          </p>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/marketplace"
              className="px-6 py-3.5 rounded-2xl bg-agri-accent hover:bg-amber-600 text-white font-extrabold text-xs sm:text-sm transition-all shadow-lg hover:scale-105 flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{t('home.ctaExplore')}</span>
            </Link>

            <button
              onClick={() => {
                setRole('farmer');
                setIsListingModalOpen(true);
              }}
              className="px-6 py-3.5 rounded-2xl bg-white text-agri-dark hover:bg-gray-100 font-extrabold text-xs sm:text-sm transition-all shadow-md flex items-center gap-2"
            >
              <Sprout className="w-4 h-4 text-emerald-600" />
              <span>{t('home.ctaList')}</span>
            </button>

            <Link
              to="/buyer"
              onClick={() => setRole('bulk_buyer')}
              className="px-5 py-3.5 rounded-2xl bg-agri-primary/70 hover:bg-agri-primary border border-white/20 text-white font-bold text-xs sm:text-sm transition-all flex items-center gap-2"
            >
              <Users className="w-4 h-4 text-agri-accent" />
              <span>{t('home.ctaBulk')}</span>
            </Link>
          </div>
        </div>

        {/* Decorative subtle background gradient element */}
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />
      </section>

      {/* Measurable Platform Impact Banner */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-agri-sm">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
            {t('home.middlemenEliminatedLabel')}
          </span>
          <p className="text-2xl sm:text-3xl font-black text-agri-dark mt-1">
            {t('home.middlemenEliminated')}
          </p>
          <span className="text-[11px] text-emerald-700 font-bold mt-1 inline-block">
            Direct Farmer Gate Sourcing
          </span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-agri-sm">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
            {t('home.farmerEarningsBoostLabel')}
          </span>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">
            {t('home.farmerEarningsBoost')}
          </p>
          <span className="text-[11px] text-gray-500 font-medium mt-1 inline-block">
            Saved Commission Retained
          </span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-agri-sm">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
            {t('home.spoilageReductionLabel')}
          </span>
          <p className="text-2xl sm:text-3xl font-black text-agri-accent mt-1">
            {t('home.spoilageReduction')}
          </p>
          <span className="text-[11px] text-gray-500 font-medium mt-1 inline-block">
            48h Farm-to-Fork Direct Transit
          </span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-agri-sm">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
            {t('home.logisticsSavingsLabel')}
          </span>
          <p className="text-2xl sm:text-3xl font-black text-blue-600 mt-1">
            {t('home.logisticsSavings')}
          </p>
          <span className="text-[11px] text-gray-500 font-medium mt-1 inline-block">
            VRP Consolidated Route Optimization
          </span>
        </div>
      </section>

      {/* Interactive Supply Chain Flow Diagram */}
      <section>
        <SupplyChainFlow />
      </section>

      {/* Featured Farm Produce Listings */}
      <section className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-xs font-extrabold text-agri-accent uppercase tracking-wider">
              {language === 'hi' ? 'सीधा खेत से ताज़ा माल' : 'Direct Harvest Available'}
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-agri-dark mt-0.5">
              {language === 'hi' ? 'ताज़ा उपलब्ध उपज' : 'Fresh Available Farm Listings'}
            </h2>
          </div>
          <Link
            to="/marketplace"
            className="text-xs sm:text-sm font-bold text-agri-primary hover:text-agri-dark flex items-center gap-1 group"
          >
            <span>{language === 'hi' ? 'सभी देखें' : 'View All Produce'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featuredListings.map((listing) => (
            <CropCard
              key={listing.id}
              listing={listing}
              onBuyNow={(l) => setSelectedListingForBuy(l)}
            />
          ))}
        </div>
      </section>

      {/* Logistics & Forecasting Teaser Banners */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Logistics Teaser */}
        <div className="bg-gradient-to-br from-agri-dark to-agri-primary text-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-agri-md border border-agri-primary/40">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-blue-500 text-white flex items-center justify-center mb-4 shadow-md">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold">
              {language === 'hi'
                ? 'स्मार्ट कृषि लॉजिस्टिक्स एवं VRP रूटिंग'
                : 'Intelligent VRP Logistics Engine'}
            </h3>
            <p className="text-xs sm:text-sm text-gray-200 mt-2 leading-relaxed font-normal">
              {language === 'hi'
                ? 'कई खेतों से माल को एक साथ उठाकर मुंबई व पुणे जैसे केंद्रों तक न्यूनतम भाड़े में पहुंचाएं।'
                : 'Consolidate multiple smallholder farm pickups into multi-drop commercial EV routes, slashing transport costs by 24.5%.'}
            </p>
          </div>
          <div className="pt-6">
            <Link
              to="/logistics"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-agri-dark font-bold text-xs hover:bg-gray-100 transition-colors shadow-sm"
            >
              <span>{language === 'hi' ? 'लॉजिस्टिक्स रूट देखें' : 'View Active Logistics Routes'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Demand Forecasting Teaser */}
        <div className="bg-gradient-to-br from-amber-700 to-agri-accent text-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-agri-md border border-amber-500/40">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-white text-agri-accent flex items-center justify-center mb-4 shadow-md">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold">
              {language === 'hi'
                ? 'एआई मांग एवं मूल्य पूर्वानुमान'
                : 'Agmarknet Intelligence & Demand AI'}
            </h3>
            <p className="text-xs sm:text-sm text-amber-100 mt-2 leading-relaxed font-normal">
              {language === 'hi'
                ? 'मंडी भाव व मौसमी खपत के आधार पर 7-दिन का सटीक अनुमान देखकर फसल कटाई की योजना बनाएं।'
                : 'Predict 7-day arrival trends and festival consumption surges with 92% confidence to maximize crop value.'}
            </p>
          </div>
          <div className="pt-6">
            <Link
              to="/insights"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-agri-dark text-white font-bold text-xs hover:bg-black transition-colors shadow-sm"
            >
              <span>{language === 'hi' ? 'पूर्वानुमान एक्सप्लोर करें' : 'Explore Market Forecasts'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Modals */}
      {selectedListingForBuy && (
        <RazorpayModal
          listing={selectedListingForBuy}
          quantityKg={selectedListingForBuy.minimum_order_kg}
          onClose={() => setSelectedListingForBuy(null)}
        />
      )}

      {isListingModalOpen && (
        <CropListingModal onClose={() => setIsListingModalOpen(false)} />
      )}
    </div>
  );
}
