'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Truck, MapPin, Navigation, Clock, Fuel, ShieldCheck, Play, Pause, RotateCcw } from 'lucide-react';
import { LogisticsRoute, DeliveryStop } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

interface OptimizedRouteMapProps {
  route: LogisticsRoute;
}

export default function OptimizedRouteMap({ route }: OptimizedRouteMapProps) {
  const { language, t } = useLanguage();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerLayerRef = useRef<any>(null);
  const animatedVehicleMarkerRef = useRef<any>(null);

  const [activeStopIndex, setActiveStopIndex] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    // Dynamically load Leaflet on client side to avoid SSR window errors
    let isMounted = true;

    const initMap = async () => {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;

      const L = (await import('leaflet')).default;
      // Inject Leaflet CSS if not already present
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      // Center map around Maharashtra Nashik-Mumbai corridor
      const map = L.map(mapContainerRef.current).setView([19.6, 73.5], 8);
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);

      // Create Custom Icons for Stops
      const createCustomIcon = (type: 'pickup' | 'dropoff' | 'hub', seq: number) => {
        const bg = type === 'pickup' ? '#2E7D32' : type === 'dropoff' ? '#D97706' : '#1E40AF';
        return L.divIcon({
          className: 'custom-map-pin',
          html: `<div style="background-color: ${bg}; color: white; border: 2px solid white; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 11px; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">${seq}</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });
      };

      const latlngs: [number, number][] = [];

      route.stops.forEach((stop) => {
        latlngs.push([stop.latitude, stop.longitude]);
        const marker = L.marker([stop.latitude, stop.longitude], {
          icon: createCustomIcon(stop.stop_type, stop.stop_sequence),
        }).addTo(map);

        const stopTypeText =
          stop.stop_type === 'pickup'
            ? '🌿 Farm Pickup'
            : stop.stop_type === 'dropoff'
            ? '🏢 Buyer Dropoff'
            : '🏭 Logistics Hub';

        marker.bindPopup(`
          <div style="font-family: sans-serif; padding: 4px;">
            <div style="font-size: 10px; font-weight: bold; color: #6B7280; text-transform: uppercase;">${stopTypeText} (Stop ${stop.stop_sequence})</div>
            <div style="font-size: 13px; font-weight: bold; color: #111827; margin: 2px 0;">${stop.location_name}</div>
            <div style="font-size: 11px; color: #4B5563;">Contact: <strong>${stop.contact_person}</strong> (${stop.contact_phone})</div>
            <div style="font-size: 11px; color: #1B4D3E; margin-top: 4px; font-weight: bold;">Cargo Delta: ${stop.cargo_delta_kg > 0 ? '+' : ''}${stop.cargo_delta_kg} kg (Load: ${stop.current_vehicle_load_kg} kg)</div>
          </div>
        `);
      });

      // Draw Route Polyline
      if (latlngs.length > 1) {
        const polyline = L.polyline(latlngs, {
          color: '#1B4D3E',
          weight: 4,
          opacity: 0.85,
          dashArray: '8, 6',
        }).addTo(map);

        map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
      }

      // Create Truck Marker for simulation
      const truckIcon = L.divIcon({
        className: 'truck-pin',
        html: `<div style="background-color: #12372A; color: #F59E0B; border: 2px solid #F59E0B; border-radius: 50%; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 12px rgba(0,0,0,0.4);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg></div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      if (route.stops[0]) {
        const vehicleMarker = L.marker([route.stops[0].latitude, route.stops[0].longitude], {
          icon: truckIcon,
          zIndexOffset: 1000,
        }).addTo(map);
        animatedVehicleMarkerRef.current = vehicleMarker;
      }
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [route]);

  // Simulation timer effect
  useEffect(() => {
    let interval: any;
    if (isSimulating) {
      interval = setInterval(() => {
        setActiveStopIndex((prev) => {
          const next = prev + 1;
          if (next >= route.stops.length) {
            setIsSimulating(false);
            return prev;
          }
          const targetStop = route.stops[next];
          if (animatedVehicleMarkerRef.current && targetStop) {
            animatedVehicleMarkerRef.current.setLatLng([targetStop.latitude, targetStop.longitude]);
          }
          return next;
        });
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isSimulating, route.stops]);

  const handleResetSimulation = () => {
    setIsSimulating(false);
    setActiveStopIndex(0);
    if (animatedVehicleMarkerRef.current && route.stops[0]) {
      animatedVehicleMarkerRef.current.setLatLng([route.stops[0].latitude, route.stops[0].longitude]);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-agri-md border border-gray-200 overflow-hidden flex flex-col">
      {/* Route Key Performance Metrics */}
      <div className="bg-agri-dark text-white p-5 sm:p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-b border-agri-primary/40">
        <div>
          <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider block">
            {t('logistics.totalDistance')}
          </span>
          <p className="text-xl sm:text-2xl font-extrabold text-white mt-0.5">
            {route.total_distance_km} <span className="text-xs text-agri-accent font-semibold">km</span>
          </p>
        </div>
        <div>
          <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider block">
            {t('logistics.savings')}
          </span>
          <p className="text-xl sm:text-2xl font-extrabold text-emerald-400 mt-0.5">
            +{route.fuel_saving_percentage}%
          </p>
        </div>
        <div>
          <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider block">
            {t('logistics.co2Saved')}
          </span>
          <p className="text-xl sm:text-2xl font-extrabold text-white mt-0.5">
            {route.co2_saved_kg} <span className="text-xs text-gray-300 font-semibold">kg</span>
          </p>
        </div>
        <div>
          <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider block">
            {t('logistics.capacityUtilization')}
          </span>
          <p className="text-xl sm:text-2xl font-extrabold text-amber-400 mt-0.5">
            {route.capacity_utilization_pct}%
          </p>
        </div>
      </div>

      {/* Map Display & Simulation Controls */}
      <div className="relative">
        <div ref={mapContainerRef} className="w-full h-[400px] sm:h-[480px] z-10" />

        {/* Floating Simulation Control Panel */}
        <div className="absolute top-4 right-4 z-20 bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-2xl shadow-xl border border-gray-200 flex items-center gap-2">
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-agri-primary hover:bg-agri-dark text-white text-xs font-bold transition-all shadow-sm"
          >
            {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isSimulating ? 'Pause' : t('logistics.driverSimulation')}</span>
          </button>
          <button
            onClick={handleResetSimulation}
            className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Live Active Waypoint Overlay */}
        <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-20 bg-agri-dark/95 text-white backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-agri-primary/40">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-agri-accent flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 animate-pulse" />
              Stop {activeStopIndex + 1} of {route.stops.length}:{' '}
              {route.stops[activeStopIndex]?.stop_type.toUpperCase()}
            </span>
            <span className="text-[11px] text-gray-300">
              ETA: +{route.stops[activeStopIndex]?.eta_minutes}m
            </span>
          </div>
          <p className="font-bold text-sm text-white mt-1 truncate">
            {route.stops[activeStopIndex]?.location_name}
          </p>
          <div className="flex items-center justify-between text-[11px] text-gray-300 mt-2 pt-2 border-t border-white/10">
            <span>Contact: {route.stops[activeStopIndex]?.contact_person}</span>
            <span>Cargo: {route.stops[activeStopIndex]?.current_vehicle_load_kg} kg load</span>
          </div>
        </div>
      </div>

      {/* Stop Sequence List */}
      <div className="p-5 sm:p-6 bg-gray-50 border-t border-gray-200">
        <h4 className="text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-3">
          {t('logistics.stopsSequence')}
        </h4>
        <div className="space-y-2.5">
          {route.stops.map((stop, idx) => {
            const isCurrent = idx === activeStopIndex;
            const isPickup = stop.stop_type === 'pickup';
            const isDropoff = stop.stop_type === 'dropoff';

            return (
              <div
                key={stop.id}
                onClick={() => {
                  setActiveStopIndex(idx);
                  if (animatedVehicleMarkerRef.current) {
                    animatedVehicleMarkerRef.current.setLatLng([stop.latitude, stop.longitude]);
                  }
                }}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  isCurrent
                    ? 'bg-agri-subtle border-agri-primary ring-2 ring-agri-primary shadow-sm'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-full text-white text-xs font-extrabold flex items-center justify-center ${
                      isPickup ? 'bg-emerald-600' : isDropoff ? 'bg-amber-600' : 'bg-blue-600'
                    }`}
                  >
                    {stop.stop_sequence}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">{stop.location_name}</p>
                    <p className="text-[10px] text-gray-500">
                      {stop.contact_person} ({stop.contact_phone})
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      isPickup
                        ? 'bg-emerald-100 text-emerald-800'
                        : isDropoff
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {isPickup ? `+${stop.cargo_delta_kg} kg` : isDropoff ? `${stop.cargo_delta_kg} kg` : 'Hub'}
                  </span>
                  <span className="text-[10px] text-gray-500 block mt-0.5">
                    +{stop.eta_minutes} mins
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
