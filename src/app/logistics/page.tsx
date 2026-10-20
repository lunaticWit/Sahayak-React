'use client';

import React, { useState } from 'react';
import {
  Truck,
  Layers,
  Fuel,
  ShieldCheck,
  Zap,
  MapPin,
  Clock,
  ArrowRight,
  Plus,
  Play,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import OptimizedRouteMap from '@/components/OptimizedRouteMap';
import { DEMO_LOGISTICS_ROUTE } from '@/lib/mockData';
import { LogisticsRoute } from '@/types';

export default function LogisticsPage() {
  const { language, t } = useLanguage();
  const [activeRoute, setActiveRoute] = useState<LogisticsRoute>(DEMO_LOGISTICS_ROUTE);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-agri-accent uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 fill-current text-agri-accent" />
              Consolidated VRP Solver
            </span>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-200">
              Active Run: {activeRoute.route_code}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-agri-dark mt-1">
            {t('logistics.title')}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            {t('logistics.subtitle')}
          </p>
        </div>
      </div>

      {/* Interactive Map & Dispatch Dashboard */}
      <div>
        <OptimizedRouteMap route={activeRoute} />
      </div>

      {/* Algorithmic Logistics Breakdown & Environmental Savings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-agri-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <Fuel className="w-5 h-5" />
          </div>
          <h4 className="text-base font-extrabold text-gray-900">
            {language === 'hi' ? 'ईंधन एवं भाड़े में बचत' : 'Fuel & Cost Efficiency'}
          </h4>
          <p className="text-xs text-gray-600 leading-relaxed">
            {language === 'hi'
              ? 'असंगठित 240 किमी व्यक्तिगत ट्रिप के मुकाबले अनुकूलित 142 किमी रूट से किसानों का भाड़ा 24.5% तक घट जाता है।'
              : 'Compared to 240 km of uncoordinated individual trips, the consolidated 142 km run slashes total freight cost by 24.5%.'}
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-agri-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <h4 className="text-base font-extrabold text-gray-900">
            {language === 'hi' ? 'वाहन क्षमता का 80% उपयोग' : '80% Capacity Utilization'}
          </h4>
          <p className="text-xs text-gray-600 leading-relaxed">
            {language === 'hi'
              ? 'खाली दौड़ने वाले वाहनों की समस्या समाप्त; खेत से माल उठाकर एक ही ट्रिप में विभिन्न सुपरमार्केट में आपूर्ति।'
              : 'Eliminates deadhead empty truck miles by loading full 2.0-ton produce capacity across multiple verified FPO pickups.'}
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-agri-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="text-base font-extrabold text-gray-900">
            {language === 'hi' ? '48 किग्रा कार्बन उत्सर्जन की रोकथाम' : 'Green Carbon Footprint'}
          </h4>
          <p className="text-xs text-gray-600 leading-relaxed">
            {language === 'hi'
              ? 'इलेक्ट्रिक पिकअप एवं सामूहिक लॉजिस्टिक्स के माध्यम से हर ट्रिप पर 48.2 किग्रा CO₂ उत्सर्जन की बचत।'
              : 'Prevents 48.2 kg of CO₂ exhaust emissions per logistics run through commercial electric vehicle fleet routing.'}
          </p>
        </div>
      </div>
    </div>
  );
}
