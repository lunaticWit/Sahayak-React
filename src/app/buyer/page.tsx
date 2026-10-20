'use client';

import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Zap,
  ShieldCheck,
  PackageCheck,
  Clock,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import RequirementModal from '@/components/RequirementModal';
import MatchingCards from '@/components/MatchingCards';
import RazorpayModal from '@/components/RazorpayModal';
import { calculateSupplyDemandMatch } from '@/lib/matching';
import { MatchResult, CropListing } from '@/types';

export default function BuyerPortalPage() {
  const { language, t } = useLanguage();
  const { currentUser, buyerProfile, requirements, listings } = useAuth();

  const [isReqModalOpen, setIsReqModalOpen] = useState(false);
  const [selectedMatchForOrder, setSelectedMatchForOrder] = useState<MatchResult | null>(null);

  // Active requirement
  const activeReq = requirements[0];

  // Calculate intelligent matches for the active requirement against available listings
  const calculatedMatches: MatchResult[] = activeReq
    ? listings
        .filter((l) => l.crop_name_en.toLowerCase().includes(activeReq.crop_name.toLowerCase()) || activeReq.crop_name.toLowerCase().includes(l.crop_name_en.toLowerCase()))
        .map((l) => calculateSupplyDemandMatch(activeReq, l))
        .sort((a, b) => b.match_score - a.match_score)
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-agri-accent uppercase tracking-wider">
              {t('buyer.portalTitle')}
            </span>
            <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-blue-200">
              Verified Institutional Buyer
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-agri-dark mt-1">
            {currentUser.full_name}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            {buyerProfile?.organization_name || 'FreshMart Supermarkets'} • GSTIN: {buyerProfile?.gstin || '27AABCF1234F1Z5'}
          </p>
        </div>

        <button
          onClick={() => setIsReqModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-agri-primary hover:bg-agri-dark text-white font-extrabold text-xs sm:text-sm shadow-md transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>{t('buyer.postRequirement')}</span>
        </button>
      </div>

      {/* Active Requirement Card */}
      {activeReq && (
        <div className="bg-gradient-to-r from-agri-dark via-agri-primary to-agri-dark text-white rounded-3xl p-6 sm:p-7 shadow-agri-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-agri-accent text-white flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-gray-300 font-bold uppercase tracking-wider">
                  Active Demand Tender
                </span>
                <h3 className="text-lg font-extrabold text-white">
                  {activeReq.crop_name} ({activeReq.variety_preference})
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs bg-emerald-500/20 border border-emerald-400 text-emerald-300 px-3 py-1 rounded-full font-bold">
                Live Sourcing • 3 FPO Matches Found
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-gray-300 block">{t('buyer.orderVolume')}</span>
              <strong className="text-base text-white font-extrabold">{activeReq.quantity_requested_kg} kg</strong>
            </div>
            <div>
              <span className="text-gray-300 block">{t('buyer.maxBudget')}</span>
              <strong className="text-base text-white font-extrabold">₹{activeReq.max_price_per_kg.toFixed(2)}/kg</strong>
            </div>
            <div>
              <span className="text-gray-300 block">{t('buyer.requiredBy')}</span>
              <strong className="text-base text-white font-extrabold">{activeReq.required_by_date}</strong>
            </div>
            <div>
              <span className="text-gray-300 block">Delivery Depot</span>
              <strong className="text-xs text-gray-200 font-bold truncate block">{activeReq.delivery_address}</strong>
            </div>
          </div>
        </div>
      )}

      {/* AI Matched Supplier FPOs */}
      <div className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-xs font-extrabold text-agri-accent uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 fill-current text-agri-accent" />
              AI Intelligent Constraint Matcher
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-agri-dark mt-0.5">
              {t('buyer.matchingFPOs')}
            </h2>
          </div>
          <span className="text-xs text-gray-500 font-bold">
            Showing top scored clusters
          </span>
        </div>

        {calculatedMatches.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 text-xs text-gray-500">
            No farmer listings currently match this specific crop requirement.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {calculatedMatches.map((match) => (
              <MatchingCards
                key={match.listing_id}
                match={match}
                onOrderClick={(m) => setSelectedMatchForOrder(m)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {isReqModalOpen && (
        <RequirementModal onClose={() => setIsReqModalOpen(false)} />
      )}

      {selectedMatchForOrder && (
        <RazorpayModal
          listing={listings.find((l) => l.id === selectedMatchForOrder.listing_id)}
          quantityKg={activeReq?.quantity_requested_kg || 400}
          onClose={() => setSelectedMatchForOrder(null)}
        />
      )}
    </div>
  );
}
