'use client';

import React from 'react';
import {
  Sprout,
  BrainCircuit,
  Users,
  Layers,
  Truck,
  MapPin,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function SupplyChainFlow() {
  const { language } = useLanguage();

  const steps = [
    {
      icon: Sprout,
      titleEn: 'Farmer Lists Produce',
      titleHi: 'किसान उपज लिस्ट करते हैं',
      descEn: 'Quantity, variety, harvest date & price with live Agmarknet benchmark comparison',
      descHi: 'मात्रा, किस्म, कटाई की तारीख व एगमार्कनेट मंडी बेंचमार्क भाव के साथ लिस्टिंग',
      color: 'bg-emerald-500',
    },
    {
      icon: BrainCircuit,
      titleEn: 'Sahayak Models Supply & Demand',
      titleHi: 'एआई आपूर्ति व मांग समझता है',
      descEn: 'Time-series predictive models forecast upcoming regional consumption spikes',
      descHi: 'टाइम-सीरीज़ मॉडल आगामी दिनों में क्षेत्रीय खपत में वृद्धि का सटीक अनुमान लगाते हैं',
      color: 'bg-blue-500',
    },
    {
      icon: Users,
      titleEn: 'Direct Multi-Factor Match',
      titleHi: 'सीधा व सटीक मैचमेकिंग',
      descEn: 'Matches based on distance (35%), price (30%), quantity (20%), and trust score (15%)',
      descHi: 'दूरी (35%), कीमत (30%), मात्रा (20%) और विश्वसनीयता (15%) के आधार पर मिलान',
      color: 'bg-indigo-500',
    },
    {
      icon: Layers,
      titleEn: 'Orders Consolidated',
      titleHi: 'ऑर्डर समेकन (Consolidation)',
      descEn: 'Combines multiple farm pickups to maximize commercial vehicle capacity load',
      descHi: 'वाहन की पूरी क्षमता का उपयोग करने के लिए कई खेतों के ऑर्डर एक साथ समेकित',
      color: 'bg-amber-500',
    },
    {
      icon: Truck,
      titleEn: 'AI VRP Route Optimization',
      titleHi: 'एआई वाहन रूट अनुकूलन (VRP)',
      descEn: 'Heuristic algorithm optimizes multi-pickup & dropoff sequence, saving ~24.5% fuel',
      descHi: 'अल्गोरिद्म सबसे छोटा रूट बनाता है, जिससे ~24.5% ईंधन और परिवहन लागत बचती है',
      color: 'bg-purple-500',
    },
    {
      icon: CheckCircle2,
      titleEn: 'Direct Farm-to-Fork Delivery',
      titleHi: 'सीधा व सुरक्षित वितरण',
      descEn: 'Verified delivery with OTP; Farmer receives +22% higher net margin',
      descHi: 'ओटीपी सत्यापन के साथ डिलीवरी; किसान को +22% अधिक शुद्ध मूल्य लाभ',
      color: 'bg-agri-primary',
    },
  ];

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-agri-md border border-gray-200/80">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <span className="text-xs font-extrabold uppercase tracking-widest text-agri-accent bg-amber-50 px-3 py-1 rounded-full border border-amber-200 inline-block mb-2">
          {language === 'hi' ? 'सीधा व पारदर्शी मॉडल' : 'Disintermediation & Intelligence'}
        </span>
        <h2 className="text-xl sm:text-2xl font-extrabold text-agri-dark">
          {language === 'hi'
            ? 'सहायक आपूर्ति श्रृंखला कैसे कार्य करती है?'
            : 'How Sahayak Powers the Direct Value Chain'}
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-2">
          {language === 'hi'
            ? 'खेत से लेकर खरीदार तक हर कदम पर बिचौलियों का खर्च घटाएं और पारदर्शिता लाएं'
            : 'From farm gate to institutional buyer — eliminating 3-5 tiers of commission agents'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={idx}
              className="relative p-5 rounded-2xl bg-agri-background hover:bg-agri-subtle/50 transition-all border border-gray-200/70 flex flex-col justify-between group hover:shadow-agri-sm"
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-10 h-10 rounded-xl ${step.color} text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Step 0{idx + 1}
                  </span>
                  <h3 className="font-bold text-sm sm:text-base text-gray-900 leading-snug">
                    {language === 'hi' ? step.titleHi : step.titleEn}
                  </h3>
                  <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                    {language === 'hi' ? step.descHi : step.descEn}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
