'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  SlidersHorizontal,
  ShieldCheck,
  MapPin,
  ShoppingCart,
  X,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import CropCard from '@/components/CropCard';
import RazorpayModal from '@/components/RazorpayModal';
import { CropListing, CropCategory } from '@/types';
import { formatINR } from '@/lib/utils';

function MarketplaceContent() {
  const { language, t } = useLanguage();
  const { listings } = useAuth();
  const { cart, updateQuantity, removeFromCart, totalAmount, clearCart } = useCart();
  const [searchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [organicOnly, setOrganicOnly] = useState(false);
  const [gradeAOnly, setGradeAOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'price_asc' | 'distance_asc' | 'rating_desc'>('rating_desc');
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(searchParams.get('cart') === 'open');
  const [selectedListingForCheckout, setSelectedListingForCheckout] = useState<CropListing | null>(null);

  const categories: { key: string; labelEn: string; labelHi: string }[] = [
    { key: 'all', labelEn: 'All Crops', labelHi: 'सभी फसलें' },
    { key: 'vegetable', labelEn: 'Vegetables', labelHi: 'सब्जियां' },
    { key: 'grain', labelEn: 'Grains & Cereals', labelHi: 'अनाज' },
    { key: 'pulse', labelEn: 'Pulses & Dal', labelHi: 'दालें' },
    { key: 'fruit', labelEn: 'Fruits', labelHi: 'फल' },
  ];

  const filteredListings = useMemo(() => {
    return listings.filter((l) => {
      // Search match
      const queryMatch =
        l.crop_name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.crop_name_hi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.variety.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.district.toLowerCase().includes(searchQuery.toLowerCase());

      if (!queryMatch) return false;

      // Category match
      if (selectedCategory !== 'all' && l.category !== selectedCategory) {
        return false;
      }

      // Organic match
      if (organicOnly && !l.organic_certified) {
        return false;
      }

      // Grade A match
      if (gradeAOnly && l.grade !== 'Grade A' && !l.organic_certified) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.price_per_kg - b.price_per_kg;
      if (sortBy === 'distance_asc') return a.latitude - b.latitude; // approximate proxy
      return b.farmer_rating - a.farmer_rating;
    });
  }, [listings, searchQuery, selectedCategory, organicOnly, gradeAOnly, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Top Header & Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-agri-dark">
              {t('marketplace.title')}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              {language === 'hi'
                ? 'सीधे सत्यापित किसानों और एफपीओ से खरीदें — बिचौलियों का कोई कमीशन नहीं'
                : 'Direct farm gate sourcing with verified mandi comparison benchmarks'}
            </p>
          </div>

          <button
            onClick={() => setIsCartDrawerOpen(true)}
            className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-agri-primary hover:bg-agri-dark text-white text-xs font-bold shadow-sm transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Basket ({cart.length})</span>
            {totalAmount > 0 && <span className="text-amber-300 font-extrabold">• {formatINR(totalAmount)}</span>}
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('marketplace.searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-300 bg-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-agri-primary focus:outline-none text-gray-900 shadow-sm"
            />
          </div>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="px-3.5 py-2.5 rounded-2xl border border-gray-300 bg-white text-xs font-bold text-gray-700 focus:ring-2 focus:ring-agri-primary focus:outline-none shadow-sm"
          >
            <option value="rating_desc">{t('marketplace.sortByRating')}</option>
            <option value="price_asc">{t('marketplace.sortByPrice')}</option>
            <option value="distance_asc">{t('marketplace.sortByDistance')}</option>
          </select>
        </div>

        {/* Category Pills & Filter Toggles */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {categories.map((c) => {
              const isSelected = selectedCategory === c.key;
              return (
                <button
                  key={c.key}
                  onClick={() => setSelectedCategory(c.key)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    isSelected
                      ? 'bg-agri-primary text-white shadow-sm'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {language === 'hi' ? c.labelHi : c.labelEn}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setOrganicOnly(!organicOnly)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1 ${
                organicOnly
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-400 ring-1 ring-emerald-400'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t('marketplace.filterOrganic')}</span>
            </button>

            <button
              onClick={() => setGradeAOnly(!gradeAOnly)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                gradeAOnly
                  ? 'bg-agri-primary text-white border-agri-primary ring-1 ring-agri-primary'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <span>{t('marketplace.filterGradeA')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Produce Grid */}
      {filteredListings.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 shadow-agri-sm space-y-3">
          <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-extrabold text-gray-900">
            {language === 'hi' ? 'कोई फसल उपलब्ध नहीं मिली' : 'No Produce Found'}
          </h3>
          <p className="text-xs text-gray-500">
            {language === 'hi'
              ? 'कृपया अन्य फिल्टर चुनें या नया खोज शब्द दर्ज करें।'
              : 'Try clearing your search query or selecting a different category filter.'}
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setOrganicOnly(false);
              setGradeAOnly(false);
            }}
            className="px-4 py-2 bg-agri-primary text-white text-xs font-bold rounded-xl"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredListings.map((listing) => (
            <CropCard
              key={listing.id}
              listing={listing}
              onBuyNow={(l) => setSelectedListingForCheckout(l)}
            />
          ))}
        </div>
      )}

      {/* Cart Slide-out Drawer */}
      {isCartDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between p-6 animate-in slide-in-from-right duration-300">
            <div>
              <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-agri-primary" />
                  <h3 className="font-extrabold text-lg text-gray-900">Shopping Basket</h3>
                </div>
                <button
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cart Items List */}
              <div className="mt-4 space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <div className="py-12 text-center text-gray-400 text-xs font-medium">
                    Your basket is empty. Add farm fresh produce to proceed.
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.listing.id}
                      className="p-3 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex-1">
                        <p className="font-extrabold text-gray-900">
                          {language === 'hi' ? item.listing.crop_name_hi : item.listing.crop_name_en}
                        </p>
                        <p className="text-[11px] text-gray-500">{item.listing.variety} • ₹{item.listing.price_per_kg}/kg</p>
                        <p className="text-[11px] text-agri-primary font-semibold mt-0.5">
                          Subtotal: ₹{(item.listing.price_per_kg * item.quantityKg).toFixed(2)}
                        </p>
                      </div>

                      {/* Quantity Modifier */}
                      <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl p-1">
                        <button
                          onClick={() => updateQuantity(item.listing.id, item.quantityKg - 10)}
                          className="p-1 rounded-lg hover:bg-gray-100 text-gray-700"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-extrabold text-xs px-1.5">{item.quantityKg} kg</span>
                        <button
                          onClick={() => updateQuantity(item.listing.id, item.quantityKg + 10)}
                          className="p-1 rounded-lg hover:bg-gray-100 text-gray-700"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.listing.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Bottom Checkout Action */}
            {cart.length > 0 && (
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-bold text-gray-500">Total Payable:</span>
                  <span className="text-xl font-extrabold text-agri-dark">{formatINR(totalAmount + 250)}</span>
                </div>
                <button
                  onClick={() => {
                    setIsCartDrawerOpen(false);
                    setSelectedListingForCheckout(cart[0]?.listing);
                  }}
                  className="w-full py-3.5 bg-agri-primary hover:bg-agri-dark text-white rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-md"
                >
                  <span>Proceed to Razorpay Escrow Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {selectedListingForCheckout && (
        <RazorpayModal
          listing={selectedListingForCheckout}
          quantityKg={selectedListingForCheckout.minimum_order_kg}
          onClose={() => setSelectedListingForCheckout(null)}
        />
      )}
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-agri-primary animate-spin" />
          <p className="text-xs font-bold text-gray-500">Loading Sahayak Marketplace...</p>
        </div>
      }
    >
      <MarketplaceContent />
    </Suspense>
  );
}
