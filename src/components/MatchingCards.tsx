'use client';

import React from 'react';
import { Star, MapPin, CheckCircle2, ShieldCheck, ArrowRight, Zap } from 'lucide-react';
import { MatchResult, CropListing } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

interface MatchingCardsProps {
  match: MatchResult;
  listing?: CropListing;
  onOrderClick: (match: MatchResult) => void;
}

export default function MatchingCards({ match, listing, onOrderClick }: MatchingCardsProps) {
  const { language, t } = useLanguage();

  const isHighMatch = match.match_score >= 85;

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-agri-sm hover:shadow-agri-md transition-all border border-gray-200 flex flex-col justify-between">
      <div>
        {/* Top Header with Score */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-agri-accent uppercase tracking-wider">
                {match.variety}
              </span>
              <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <MapPin className="w-3 h-3 text-agri-accent" />
                {match.distance_km} km away
              </span>
            </div>
            <h4 className="text-lg font-extrabold text-gray-900 mt-1">
              {match.farmer_name}
            </h4>
            {match.fpo_name && (
              <p className="text-xs text-agri-primary font-semibold truncate">
                {match.fpo_name}
              </p>
            )}
          </div>

          {/* Big Match Score Badge */}
          <div className="flex flex-col items-end">
            <div
              className={`px-3 py-1.5 rounded-2xl flex items-center gap-1 font-black text-base shadow-sm ${
                isHighMatch
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : 'bg-amber-100 text-amber-900 border border-amber-300'
              }`}
            >
              <Zap className="w-4 h-4 fill-current text-emerald-600" />
              <span>{match.match_score}% Match</span>
            </div>
            <span className="text-[10px] text-gray-400 font-semibold mt-0.5">
              AI Multi-Factor Score
            </span>
          </div>
        </div>

        {/* Score Breakdown Bars */}
        <div className="mt-4 grid grid-cols-2 gap-2.5 bg-gray-50 p-3 rounded-2xl border border-gray-200/60">
          <div>
            <div className="flex justify-between text-[11px] font-bold text-gray-600 mb-1">
              <span>Proximity:</span>
              <span>{match.score_breakdown.distance_score}%</span>
            </div>
            <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-1.5 rounded-full"
                style={{ width: `${match.score_breakdown.distance_score}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] font-bold text-gray-600 mb-1">
              <span>Price Fit:</span>
              <span>{match.score_breakdown.price_score}%</span>
            </div>
            <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-1.5 rounded-full"
                style={{ width: `${match.score_breakdown.price_score}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] font-bold text-gray-600 mb-1">
              <span>Volume (Fulfillment):</span>
              <span>{match.fulfillment_percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-600 h-1.5 rounded-full"
                style={{ width: `${match.fulfillment_percentage}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] font-bold text-gray-600 mb-1">
              <span>Farmer Trust:</span>
              <span>{match.score_breakdown.trust_score}%</span>
            </div>
            <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-purple-600 h-1.5 rounded-full"
                style={{ width: `${match.score_breakdown.trust_score}%` }}
              />
            </div>
          </div>
        </div>

        {/* Explainable AI Rationale List */}
        <div className="mt-3.5 space-y-1.5">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
            {t('buyer.breakdownTitle')}
          </span>
          {match.reasons.map((r, i) => (
            <div key={i} className="flex items-start gap-1.5 text-xs text-gray-700 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>{r}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Pricing & Action */}
      <div className="mt-5 pt-3.5 border-t border-gray-100 flex items-center justify-between">
        <div>
          <span className="text-[11px] text-gray-500 block">Asking Price</span>
          <span className="text-xl font-extrabold text-agri-dark">
            ₹{match.asking_price.toFixed(2)}
            <span className="text-xs font-normal text-gray-500">/kg</span>
          </span>
        </div>

        <button
          onClick={() => onOrderClick(match)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-agri-primary hover:bg-agri-dark text-white rounded-xl text-xs font-bold transition-all shadow-sm"
        >
          <span>{t('buyer.directOrder')}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
