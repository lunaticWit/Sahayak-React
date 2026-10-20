export type UserRole = 'farmer' | 'fpo' | 'consumer' | 'bulk_buyer' | 'logistics_driver' | 'admin';

export type Language = 'en' | 'hi';

export interface UserProfile {
  id: string;
  role: UserRole;
  full_name: string;
  phone: string;
  language_preference: Language;
  avatar_url?: string;
  created_at: string;
}

export interface FarmerProfile {
  id: string;
  farm_name: string;
  fpo_name?: string;
  farm_size_acres: number;
  state: string;
  district: string;
  village?: string;
  pincode: string;
  latitude: number;
  longitude: number;
  is_verified: boolean;
  rating: number;
  total_sales_kg: number;
}

export interface BuyerProfile {
  id: string;
  buyer_type: 'consumer' | 'retailer' | 'restaurant' | 'processor' | 'institutional';
  organization_name?: string;
  gstin?: string;
  delivery_address: string;
  state: string;
  district: string;
  pincode: string;
  latitude: number;
  longitude: number;
}

export type CropCategory = 'vegetable' | 'grain' | 'pulse' | 'fruit' | 'spice' | 'oilseed';

export interface Crop {
  id: string;
  name_en: string;
  name_hi: string;
  category: CropCategory;
  shelf_life_days: number;
  standard_unit: 'kg' | 'quintal' | 'ton';
  image_url?: string;
}

export type ListingGrade = 'Grade A' | 'Grade B' | 'Grade C' | 'Organic Certified' | 'Standard';
export type ListingStatus = 'active' | 'reserved' | 'sold' | 'expired';

export interface CropListing {
  id: string;
  farmer_id: string;
  farmer_name: string;
  fpo_name?: string;
  farmer_rating: number;
  crop_id: string;
  crop_name_en: string;
  crop_name_hi: string;
  category: CropCategory;
  variety: string;
  quantity_available_kg: number;
  minimum_order_kg: number;
  price_per_kg: number;
  harvest_date: string;
  available_from: string;
  grade: ListingGrade;
  organic_certified: boolean;
  quality_description?: string;
  images: string[];
  state: string;
  district: string;
  latitude: number;
  longitude: number;
  status: ListingStatus;
  indicative_mandi_price?: number;
  created_at: string;
}

export interface BuyerRequirement {
  id: string;
  buyer_id: string;
  buyer_name: string;
  buyer_type: string;
  crop_id: string;
  crop_name: string;
  variety_preference?: string;
  quantity_requested_kg: number;
  max_price_per_kg: number;
  required_by_date: string;
  delivery_address: string;
  delivery_lat: number;
  delivery_lng: number;
  status: 'open' | 'matched' | 'fulfilled' | 'cancelled';
  created_at: string;
}

export interface MatchResult {
  listing_id: string;
  farmer_name: string;
  fpo_name?: string;
  crop_name: string;
  variety: string;
  match_score: number;
  distance_km: number;
  asking_price: number;
  max_budget: number;
  quantity_available_kg: number;
  quantity_requested_kg: number;
  fulfillment_percentage: number;
  score_breakdown: {
    distance_score: number;
    price_score: number;
    quantity_score: number;
    trust_score: number;
  };
  reasons: string[];
}

export type OrderStatus = 
  | 'pending'
  | 'accepted'
  | 'confirmed'
  | 'preparing'
  | 'dispatched'
  | 'in_transit'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'rejected';

export type PaymentStatus = 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded';

export interface Order {
  id: string;
  order_number: string;
  buyer_id: string;
  buyer_name: string;
  buyer_phone: string;
  farmer_id: string;
  farmer_name: string;
  fpo_name?: string;
  listing_id: string;
  crop_name_en: string;
  crop_name_hi: string;
  variety: string;
  quantity_kg: number;
  unit_price: number;
  total_amount: number;
  platform_fee: number;
  delivery_fee: number;
  delivery_address: string;
  delivery_lat: number;
  delivery_lng: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  delivery_otp?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentRecord {
  id: string;
  order_id: string;
  razorpay_order_id: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  idempotency_key: string;
  created_at: string;
}

export interface DeliveryStop {
  id: string;
  route_id: string;
  order_id?: string;
  stop_sequence: number;
  stop_type: 'pickup' | 'dropoff' | 'hub';
  location_name: string;
  contact_person: string;
  contact_phone: string;
  latitude: number;
  longitude: number;
  cargo_delta_kg: number;
  current_vehicle_load_kg: number;
  distance_from_prev_km: number;
  eta_minutes: number;
  status: 'pending' | 'arrived' | 'completed' | 'skipped';
}

export interface LogisticsRoute {
  id: string;
  route_code: string;
  vehicle_type: string;
  vehicle_capacity_kg: number;
  total_distance_km: number;
  estimated_duration_minutes: number;
  capacity_utilization_pct: number;
  fuel_saving_percentage: number;
  co2_saved_kg: number;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  stops: DeliveryStop[];
  created_at: string;
}

export interface MandiPrice {
  id: string;
  commodity: string;
  state: string;
  district: string;
  market_name: string;
  modal_price_per_kg: number;
  min_price_per_kg: number;
  max_price_per_kg: number;
  price_date: string;
  source: string;
  trend?: 'up' | 'down' | 'stable';
  change_percent?: number;
}

export interface ForecastPoint {
  date: string;
  day_number: number;
  predicted_price_per_kg: number;
  price_lower_bound: number;
  price_upper_bound: number;
  demand_index: number;
  demand_lower_bound: number;
  demand_upper_bound: number;
}

export interface DemandForecast {
  commodity: string;
  district: string;
  current_price: number;
  days_ahead: number;
  trend: 'increasing' | 'stable' | 'decreasing' | 'highly_volatile';
  confidence_score: number;
  projected_change_percent: number;
  recommendation_en: string;
  recommendation_hi: string;
  forecast_points: ForecastPoint[];
  model_metadata: {
    algorithm: string;
    last_trained_at: string;
    data_sources: string[];
  };
}

export interface VoiceQueryResult {
  transcript: string;
  intent: 'price_inquiry' | 'demand_forecast' | 'order_status' | 'crop_advice' | 'listing_action' | 'general';
  response_en: string;
  response_hi: string;
  suggested_action_url?: string;
  data_payload?: any;
}
