'use client';

import React, { useState } from 'react';
import { X, Check, Sprout, ArrowRight, ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { INITIAL_CROPS, MANDI_PRICES } from '@/lib/mockData';
import { CropListing, ListingGrade } from '@/types';

interface CropListingModalProps {
  onClose: () => void;
}

export default function CropListingModal({ onClose }: CropListingModalProps) {
  const { language, t } = useLanguage();
  const { addListing, farmerProfile, currentUser } = useAuth();

  const [step, setStep] = useState(1);
  const [selectedCropId, setSelectedCropId] = useState(INITIAL_CROPS[0].id);
  const [variety, setVariety] = useState('Abhinav Red Hybrid');
  const [quantityKg, setQuantityKg] = useState(500);
  const [minimumOrderKg, setMinimumOrderKg] = useState(25);
  const [pricePerKg, setPricePerKg] = useState(28);
  const [harvestDate, setHarvestDate] = useState(new Date().toISOString().split('T')[0]);
  const [grade, setGrade] = useState<ListingGrade>('Grade A');
  const [organicCertified, setOrganicCertified] = useState(true);
  const [description, setDescription] = useState('Farm harvested, carefully graded, suitable for immediate transit.');
  const [isSuccess, setIsSuccess] = useState(false);

  const selectedCrop = INITIAL_CROPS.find((c) => c.id === selectedCropId) || INITIAL_CROPS[0];
  const mandiBenchmark = MANDI_PRICES.find((m) =>
    m.commodity.toLowerCase().includes(selectedCrop.name_en.toLowerCase())
  )?.modal_price_per_kg || 25.0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    addListing({
      farmer_id: currentUser.id,
      farmer_name: currentUser.full_name,
      fpo_name: farmerProfile?.fpo_name || 'Nashik Vegetable Growers FPO',
      farmer_rating: farmerProfile?.rating || 4.9,
      crop_id: selectedCrop.id,
      crop_name_en: selectedCrop.name_en,
      crop_name_hi: selectedCrop.name_hi,
      category: selectedCrop.category,
      variety,
      quantity_available_kg: Number(quantityKg),
      minimum_order_kg: Number(minimumOrderKg),
      price_per_kg: Number(pricePerKg),
      harvest_date: harvestDate,
      available_from: harvestDate,
      grade,
      organic_certified: organicCertified,
      quality_description: description,
      images: [selectedCrop.image_url || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop'],
      state: farmerProfile?.state || 'Maharashtra',
      district: farmerProfile?.district || 'Nashik',
      latitude: farmerProfile?.latitude || 20.1983,
      longitude: farmerProfile?.longitude || 73.8344,
      status: 'active',
      indicative_mandi_price: mandiBenchmark,
    });

    setIsSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden border border-gray-200">
        {/* Modal Header */}
        <div className="bg-agri-dark text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-agri-medium flex items-center justify-center">
              <Sprout className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">{t('listingForm.title')}</h3>
              <p className="text-[11px] text-gray-300">
                {language === 'hi' ? 'कदम ' + step + ' का 4' : 'Step ' + step + ' of 4'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/20 text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="w-full bg-gray-100 h-1.5">
          <div
            className="bg-agri-accent h-1.5 transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Form Body */}
        {isSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <h4 className="text-xl font-extrabold text-gray-900">
              {language === 'hi' ? 'उपज सफलतापूर्वक लिस्ट हुई!' : 'Produce Listed Successfully!'}
            </h4>
            <p className="text-sm text-gray-600">
              {t('listingForm.successMsg')}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Step 1: Crop Selection */}
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    {t('listingForm.cropLabel')}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {INITIAL_CROPS.map((crop) => {
                      const isSelected = crop.id === selectedCropId;
                      return (
                        <button
                          key={crop.id}
                          type="button"
                          onClick={() => setSelectedCropId(crop.id)}
                          className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                            isSelected
                              ? 'border-agri-primary bg-agri-subtle text-agri-dark ring-2 ring-agri-primary font-bold shadow-sm'
                              : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                          }`}
                        >
                          <span className="text-xs font-bold">
                            {language === 'hi' ? crop.name_hi : crop.name_en}
                          </span>
                          <span className="text-[10px] text-gray-500 capitalize">{crop.category}</span>
                        </button>
                      );
                    })}
                  </div>
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
                    placeholder={t('listingForm.varietyPlaceholder')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-agri-primary focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Quantity & Pricing */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      {t('listingForm.qtyLabel')}
                    </label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={quantityKg}
                      onChange={(e) => setQuantityKg(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-bold focus:ring-2 focus:ring-agri-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      {t('listingForm.minOrderLabel')}
                    </label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={minimumOrderKg}
                      onChange={(e) => setMinimumOrderKg(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-bold focus:ring-2 focus:ring-agri-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    {t('listingForm.priceLabel')}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-gray-500 font-bold text-sm">₹</span>
                    <input
                      type="number"
                      step="0.5"
                      min={1}
                      required
                      value={pricePerKg}
                      onChange={(e) => setPricePerKg(Number(e.target.value))}
                      className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-gray-300 text-base font-extrabold focus:ring-2 focus:ring-agri-primary focus:outline-none text-agri-dark"
                    />
                  </div>
                </div>

                {/* Mandi Benchmark Guidance Box */}
                <div className="bg-amber-50 rounded-2xl p-3.5 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">
                      {language === 'hi' ? 'एगमार्कनेट मंडी बेंचमार्क: ' : 'Live Agmarknet Benchmark: '}
                      ₹{mandiBenchmark.toFixed(2)}/kg
                    </p>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      {language === 'hi'
                        ? 'सीधे खरीदार से ₹' + pricePerKg + '/किग्रा मिलने पर आप बिचौलियों का 15-20% कमीशन बचा रहे हैं।'
                        : 'At ₹' + pricePerKg + '/kg, you retain 15-22% extra margin by bypassing intermediary commissions.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Harvest & Quality Grade */}
            {step === 3 && (
              <div className="space-y-4 animate-in fade-in">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    {t('listingForm.harvestDateLabel')}
                  </label>
                  <input
                    type="date"
                    required
                    value={harvestDate}
                    onChange={(e) => setHarvestDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-agri-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    {t('listingForm.gradeLabel')}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['Grade A', 'Grade B', 'Grade C', 'Organic Certified', 'Standard'] as const).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGrade(g)}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                          grade === g
                            ? 'bg-agri-primary text-white border-agri-primary shadow-sm'
                            : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="organicCheck"
                    checked={organicCertified}
                    onChange={(e) => setOrganicCertified(e.target.checked)}
                    className="w-4 h-4 rounded text-agri-primary focus:ring-agri-primary"
                  />
                  <label htmlFor="organicCheck" className="text-xs font-bold text-gray-800 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    {t('listingForm.organicLabel')}
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    {t('listingForm.descriptionLabel')}
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-agri-primary focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Step 4: Summary & Publish */}
            {step === 4 && (
              <div className="space-y-4 animate-in fade-in">
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-2.5 text-xs text-gray-700">
                  <div className="flex justify-between border-b border-gray-200/60 pb-2">
                    <span className="font-semibold text-gray-500">{t('listingForm.cropLabel')}:</span>
                    <strong className="font-bold text-gray-900">
                      {language === 'hi' ? selectedCrop.name_hi : selectedCrop.name_en} ({variety})
                    </strong>
                  </div>
                  <div className="flex justify-between border-b border-gray-200/60 pb-2">
                    <span className="font-semibold text-gray-500">{t('listingForm.qtyLabel')}:</span>
                    <strong className="font-bold text-gray-900">{quantityKg} kg (Min: {minimumOrderKg} kg)</strong>
                  </div>
                  <div className="flex justify-between border-b border-gray-200/60 pb-2">
                    <span className="font-semibold text-gray-500">{t('listingForm.priceLabel')}:</span>
                    <strong className="font-extrabold text-agri-dark text-sm">₹{pricePerKg.toFixed(2)}/kg</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-500">{t('listingForm.gradeLabel')}:</span>
                    <strong className="font-bold text-emerald-700">{grade}</strong>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 font-medium">
                  {language === 'hi'
                    ? 'आपकी उपज तुरंत नासिक-मुंबई कॉरिडोर के थोक खरीदारों को दिखाई देगी।'
                    : 'Your listing will be instantly discoverable by verified buyers across Maharashtra & Mumbai.'}
                </div>
              </div>
            )}

            {/* Step Navigation Buttons */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{language === 'hi' ? 'पिछला' : 'Back'}</span>
                </button>
              ) : (
                <div />
              )}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="flex items-center gap-1 px-5 py-2.5 rounded-xl text-xs font-bold bg-agri-primary hover:bg-agri-dark text-white shadow-sm"
                >
                  <span>{language === 'hi' ? 'अगला' : 'Next'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-extrabold bg-agri-accent hover:bg-amber-600 text-white shadow-md"
                >
                  <Check className="w-4 h-4" />
                  <span>{t('listingForm.publishBtn')}</span>
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
