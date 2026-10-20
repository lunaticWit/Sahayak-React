'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Minus, ShieldAlert, Sparkles, BrainCircuit } from 'lucide-react';
import { DemandForecast } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

interface DemandForecastChartProps {
  forecast: DemandForecast;
}

export default function DemandForecastChart({ forecast }: DemandForecastChartProps) {
  const { language, t } = useLanguage();

  const isUp = forecast.trend === 'increasing';
  const isDown = forecast.trend === 'decreasing';

  // Build SVG points for 7-day demand index curve
  const points = forecast.forecast_points;
  const width = 600;
  const height = 180;
  const padding = 30;

  const minVal = Math.min(...points.map((p) => p.demand_lower_bound), 90);
  const maxVal = Math.max(...points.map((p) => p.demand_upper_bound), 125);

  const getX = (idx: number) => padding + (idx / (points.length - 1)) * (width - padding * 2);
  const getY = (val: number) => height - padding - ((val - minVal) / (maxVal - minVal)) * (height - padding * 2);

  const mainPathData = points
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getY(p.demand_index)}`)
    .join(' ');

  // Upper & Lower envelope path for uncertainty band
  const upperPoints = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getY(p.demand_upper_bound)}`).join(' ');
  const lowerPoints = points.slice().reverse().map((p, idx) => `L ${getX(points.length - 1 - idx)} ${getY(p.demand_lower_bound)}`).join(' ');
  const areaBandPath = `${upperPoints} ${lowerPoints} Z`;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-agri-md border border-gray-200/80 space-y-6">
      {/* Header with Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-agri-accent uppercase tracking-wider">
              {forecast.district} District • {forecast.commodity}
            </span>
            <span className="bg-agri-subtle text-agri-primary text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-agri-primary/20 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-agri-accent" />
              {forecast.confidence_score}% {t('insights.confidenceLevel')}
            </span>
          </div>
          <h3 className="text-xl font-extrabold text-gray-900 mt-1">
            {t('insights.predictedDemand')}
          </h3>
        </div>

        {/* Trend Indicator Badge */}
        <div className="flex items-center gap-2">
          {isUp && (
            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-xl font-extrabold text-xs">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>+{forecast.projected_change_percent}% Demand Surge</span>
            </div>
          )}
          {isDown && (
            <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-800 px-3 py-1.5 rounded-xl font-extrabold text-xs">
              <TrendingDown className="w-4 h-4 text-red-600" />
              <span>{forecast.projected_change_percent}% Demand Softening</span>
            </div>
          )}
          {!isUp && !isDown && (
            <div className="flex items-center gap-1.5 bg-gray-100 border border-gray-200 text-gray-800 px-3 py-1.5 rounded-xl font-extrabold text-xs">
              <Minus className="w-4 h-4 text-gray-600" />
              <span>Stable Trajectory</span>
            </div>
          )}
        </div>
      </div>

      {/* SVG Time-Series Chart */}
      <div className="w-full bg-agri-background rounded-2xl p-4 border border-gray-200/70 overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44 overflow-visible">
          {/* Grid lines */}
          <line x1={padding} y1={getY(100)} x2={width - padding} y2={getY(100)} stroke="#D1D5DB" strokeDasharray="4 4" />
          <text x={padding + 4} y={getY(100) - 4} fontSize="9" fill="#9CA3AF" fontWeight="bold">
            Baseline Index (100)
          </text>

          {/* Uncertainty Band (Confidence Interval) */}
          <path d={areaBandPath} fill="#1B4D3E" fillOpacity="0.1" />

          {/* Main Demand Curve Line */}
          <path d={mainPathData} fill="none" stroke="#1B4D3E" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Data Points */}
          {points.map((p, idx) => {
            const cx = getX(idx);
            const cy = getY(p.demand_index);
            return (
              <g key={idx}>
                <circle cx={cx} cy={cy} r="4.5" fill="#FFFFFF" stroke="#1B4D3E" strokeWidth="2.5" />
                <text x={cx} y={height - 6} fontSize="10" fill="#4B5563" textAnchor="middle" fontWeight="bold">
                  Day {p.day_number}
                </text>
                <text x={cx} y={cy - 8} fontSize="9" fill="#1B4D3E" textAnchor="middle" fontWeight="extrabold">
                  {p.demand_index}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="flex items-center justify-between text-[11px] text-gray-500 mt-2 px-2">
          <span>📅 Today (Current Gate Price: ₹{forecast.current_price.toFixed(2)}/kg)</span>
          <span className="font-semibold text-agri-primary">AI Forecast Envelope (Next 7 Days)</span>
        </div>
      </div>

      {/* Actionable Agronomic Advisory Card */}
      <div className="bg-agri-subtle/80 rounded-2xl p-4 border border-agri-primary/20 flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-agri-primary text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
          <BrainCircuit className="w-4 h-4 text-agri-accent" />
        </div>
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-agri-dark uppercase tracking-wider">
            {t('insights.actionableAdvisory')}
          </h4>
          <p className="text-xs sm:text-sm text-gray-900 font-medium leading-relaxed">
            {language === 'hi' ? forecast.recommendation_hi : forecast.recommendation_en}
          </p>
        </div>
      </div>

      {/* Model Transparency & Provenance Notice */}
      <div className="text-[11px] text-gray-400 border-t border-gray-100 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <span>Model: {forecast.model_metadata.algorithm}</span>
        <span>Data Sources: {forecast.model_metadata.data_sources.join(', ')}</span>
      </div>
    </div>
  );
}
