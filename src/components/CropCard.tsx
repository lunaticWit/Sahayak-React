'use client';

import React from 'react';
import { Star, MapPin, ShieldCheck, ShoppingCart, ArrowRight } from 'lucide-react';
import { CropListing } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { formatINR } from '@/lib/utils';

interface CropCardProps {
  listing: CropListing;
  onBuyNow?: (listing: CropListing) => void;
}

export default function CropCard({ listing, onBuyNow }: CropCardProps) {
  const { language, t } = useLanguage();
  const { addToCart } = useCart();

  const isOrganic = listing.organic_certified;
  const mandiPrice = listing.indicative_mandi_price || listing.price_per_kg * 0.92;
  const priceDiff = listing.price_per_kg - mandiPrice;
  const isDirectPremium = priceDiff > 0;

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-200/80 shadow-agri-sm hover:shadow-agri-md transition-all duration-300 flex flex-col group">
      {/* Image & Badges */}
      <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
        {listing.images && listing.images[0] ? (
          <img
            src={listing.images[0]}
            alt={listing.crop_name_en}
            className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-agri-subtle text-agri-primary font-bold">
            {listing.crop_name_en}
          </div>
        )}

        {/* Grade Badge */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          <span className="bg-agri-dark/85 backdrop-blur text-white text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow-sm">
            {listing.grade}
          </span>
          {isOrganic && (
            <span className="bg-emerald-600/90 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              {language === 'hi' ? 'जैविक' : 'Organic'}
            </span>
          )}
        </div>

        {/* State/District Badge */}
        <div className="absolute top-3 right-3">
          <span className="bg-white/90 backdrop-blur text-gray-800 text-[11px] font-semibold px-2 py-0.5 rounded-md shadow-sm flex items-center gap-1">
            <MapPin className="w-3 h-3 text-agri-accent" />
            {listing.district}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Variety & Commodity */}
          <div className="flex items-baseline justify-between">
            <span className="text-[11px] font-bold text-agri-accent uppercase tracking-wider">
              {listing.variety}
            </span>
            <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{listing.farmer_rating.toFixed(1)}</span>
            </div>
          </div>

          <h3 className="text-lg font-extrabold text-gray-900 mt-0.5">
            {language === 'hi' ? listing.crop_name_hi : listing.crop_name_en}
          </h3>

          {/* Farmer & FPO info */}
          <div className="mt-1 text-xs text-gray-600">
            <p className="font-semibold text-gray-800">{listing.farmer_name}</p>
            {listing.fpo_name && (
              <p className="text-[11px] text-agri-primary font-medium truncate">
                {listing.fpo_name}
              </p>
            )}
          </div>

          {/* Stock & Minimum Order */}
          <div className="mt-3 flex items-center justify-between text-xs bg-gray-50 px-2.5 py-1.5 rounded-xl border border-gray-200/60">
            <span className="text-gray-500">
              {language === 'hi' ? 'उपलब्ध स्टॉक:' : 'Available:'}{' '}
              <strong className="text-gray-900 font-bold">{listing.quantity_available_kg} kg</strong>
            </span>
            <span className="text-gray-500">
              {language === 'hi' ? 'न्यूनतम:' : 'Min:'}{' '}
              <strong className="text-gray-900 font-bold">{listing.minimum_order_kg} kg</strong>
            </span>
          </div>

          {/* Price & Mandi Benchmark Comparison */}
          <div className="mt-3.5 pt-3 border-t border-gray-100 flex items-baseline justify-between">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-extrabold text-agri-dark">
                  ₹{listing.price_per_kg.toFixed(2)}
                </span>
                <span className="text-xs text-gray-500">/ kg</span>
              </div>
              {/* Agmarknet comparison note */}
              <div className="text-[10px] text-gray-500 mt-0.5">
                <span>{language === 'hi' ? 'मंडी बेंचमार्क: ' : 'Mandi Avg: '}</span>
                <span className="font-semibold text-gray-700">₹{mandiPrice.toFixed(2)}/kg</span>
              </div>
            </div>

            {/* Direct Farm Fresh realization badge */}
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg">
              {language === 'hi' ? 'सीधा खेत से' : 'Direct Farm Gate'}
            </span>
          </div>
        </div>

        {/* Card Actions */}
        <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2">
          <button
            onClick={() => addToCart(listing, listing.minimum_order_kg)}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-agri-primary text-agri-primary hover:bg-agri-subtle text-xs font-bold transition-colors"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>{t('marketplace.addToCart')}</span>
          </button>
          <button
            onClick={() => onBuyNow ? onBuyNow(listing) : addToCart(listing, listing.minimum_order_kg)}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-agri-primary hover:bg-agri-dark text-white text-xs font-bold transition-colors shadow-sm"
          >
            <span>{t('marketplace.buyNow')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
