-- Sahayak: Smart Agricultural Marketplace (SIH 2026 PS 33)
-- 001_initial_schema.sql
-- Relational database schema with Row Level Security (RLS) & Constraints

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES (Base user table linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(30) NOT NULL CHECK (role IN ('farmer', 'fpo', 'consumer', 'bulk_buyer', 'logistics_driver', 'admin')),
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    language_preference VARCHAR(10) DEFAULT 'en' CHECK (language_preference IN ('en', 'hi', 'mr', 'pa', 'te', 'ta')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. FARMER PROFILES (Farm and FPO details)
CREATE TABLE IF NOT EXISTS public.farmer_profiles (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    farm_name VARCHAR(255) NOT NULL,
    fpo_name VARCHAR(255),
    farm_size_acres NUMERIC(8, 2) CHECK (farm_size_acres > 0),
    state VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    village VARCHAR(100),
    pincode VARCHAR(10) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    rating NUMERIC(3, 2) DEFAULT 5.00 CHECK (rating >= 1.00 AND rating <= 5.00),
    total_sales_kg NUMERIC(12, 2) DEFAULT 0 CHECK (total_sales_kg >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. BUYER PROFILES (Consumers, Retailers, Hotels, Processors)
CREATE TABLE IF NOT EXISTS public.buyer_profiles (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    buyer_type VARCHAR(50) NOT NULL CHECK (buyer_type IN ('consumer', 'retailer', 'restaurant', 'processor', 'institutional')),
    organization_name VARCHAR(255),
    gstin VARCHAR(20),
    delivery_address TEXT NOT NULL,
    state VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CROPS (Commodity Catalog)
CREATE TABLE IF NOT EXISTS public.crops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_en VARCHAR(100) NOT NULL UNIQUE,
    name_hi VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('vegetable', 'grain', 'pulse', 'fruit', 'spice', 'oilseed')),
    shelf_life_days INT NOT NULL CHECK (shelf_life_days > 0),
    standard_unit VARCHAR(20) DEFAULT 'kg' CHECK (standard_unit IN ('kg', 'quintal', 'ton')),
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CROP LISTINGS (Farmer Produce for Sale)
CREATE TABLE IF NOT EXISTS public.crop_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id UUID NOT NULL REFERENCES public.farmer_profiles(id) ON DELETE CASCADE,
    crop_id UUID NOT NULL REFERENCES public.crops(id) ON DELETE RESTRICT,
    variety VARCHAR(100) NOT NULL,
    quantity_available_kg NUMERIC(10, 2) NOT NULL CHECK (quantity_available_kg >= 0),
    minimum_order_kg NUMERIC(10, 2) DEFAULT 1.00 CHECK (minimum_order_kg > 0),
    price_per_kg NUMERIC(10, 2) NOT NULL CHECK (price_per_kg > 0),
    harvest_date DATE NOT NULL,
    available_from DATE DEFAULT CURRENT_DATE,
    grade VARCHAR(20) DEFAULT 'Grade A' CHECK (grade IN ('Grade A', 'Grade B', 'Grade C', 'Organic Certified', 'Standard')),
    organic_certified BOOLEAN DEFAULT FALSE,
    quality_description TEXT,
    images TEXT[] DEFAULT '{}',
    status VARCHAR(30) DEFAULT 'active' CHECK (status IN ('active', 'reserved', 'sold', 'expired')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. BUYER REQUIREMENTS (Bulk Demand Posts)
CREATE TABLE IF NOT EXISTS public.buyer_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID NOT NULL REFERENCES public.buyer_profiles(id) ON DELETE CASCADE,
    crop_id UUID NOT NULL REFERENCES public.crops(id) ON DELETE RESTRICT,
    variety_preference VARCHAR(100),
    quantity_requested_kg NUMERIC(10, 2) NOT NULL CHECK (quantity_requested_kg > 0),
    max_price_per_kg NUMERIC(10, 2) NOT NULL CHECK (max_price_per_kg > 0),
    required_by_date DATE NOT NULL,
    delivery_address TEXT NOT NULL,
    delivery_lat DOUBLE PRECISION NOT NULL,
    delivery_lng DOUBLE PRECISION NOT NULL,
    status VARCHAR(30) DEFAULT 'open' CHECK (status IN ('open', 'matched', 'fulfilled', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. MATCHES (AI-calculated Supply & Demand matches)
CREATE TABLE IF NOT EXISTS public.matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requirement_id UUID NOT NULL REFERENCES public.buyer_requirements(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES public.crop_listings(id) ON DELETE CASCADE,
    match_score NUMERIC(5, 2) NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
    distance_km NUMERIC(8, 2) NOT NULL CHECK (distance_km >= 0),
    score_breakdown JSONB NOT NULL,
    status VARCHAR(30) DEFAULT 'suggested' CHECK (status IN ('suggested', 'accepted_by_buyer', 'accepted_by_farmer', 'converted_to_order', 'dismissed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ORDERS (Transactional Order lifecycle)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    buyer_id UUID NOT NULL REFERENCES public.buyer_profiles(id) ON DELETE RESTRICT,
    farmer_id UUID NOT NULL REFERENCES public.farmer_profiles(id) ON DELETE RESTRICT,
    listing_id UUID NOT NULL REFERENCES public.crop_listings(id) ON DELETE RESTRICT,
    quantity_kg NUMERIC(10, 2) NOT NULL CHECK (quantity_kg > 0),
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price > 0),
    total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount > 0),
    platform_fee NUMERIC(10, 2) DEFAULT 0.00 CHECK (platform_fee >= 0),
    delivery_fee NUMERIC(10, 2) DEFAULT 0.00 CHECK (delivery_fee >= 0),
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'confirmed', 'preparing', 'dispatched', 'in_transit', 'delivered', 'completed', 'cancelled', 'rejected')),
    payment_status VARCHAR(30) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'authorized', 'captured', 'failed', 'refunded')),
    delivery_otp VARCHAR(6),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. PAYMENTS (Razorpay verified records)
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE RESTRICT,
    razorpay_order_id VARCHAR(100) NOT NULL,
    razorpay_payment_id VARCHAR(100),
    razorpay_signature VARCHAR(255),
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(10) DEFAULT 'INR',
    status VARCHAR(30) DEFAULT 'created' CHECK (status IN ('created', 'authorized', 'captured', 'failed', 'refunded')),
    idempotency_key VARCHAR(100) UNIQUE NOT NULL,
    webhook_payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    verified_at TIMESTAMPTZ
);

-- 10. LOGISTICS ROUTES & DELIVERIES (Consolidated VRP Routing)
CREATE TABLE IF NOT EXISTS public.routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_code VARCHAR(50) UNIQUE NOT NULL,
    driver_id UUID REFERENCES public.profiles(id),
    vehicle_type VARCHAR(50) DEFAULT 'Electric Pickup Truck' CHECK (vehicle_type IN ('Mini Truck (Tata Ace)', 'Electric Pickup Truck', 'Medium Commercial Vehicle (7.5T)', 'Heavy Freight Truck')),
    vehicle_capacity_kg NUMERIC(10, 2) NOT NULL CHECK (vehicle_capacity_kg > 0),
    total_distance_km NUMERIC(8, 2) NOT NULL CHECK (total_distance_km >= 0),
    estimated_duration_mins INT NOT NULL CHECK (estimated_duration_mins >= 0),
    fuel_saving_percentage NUMERIC(5, 2) DEFAULT 0 CHECK (fuel_saving_percentage >= 0),
    co2_saved_kg NUMERIC(8, 2) DEFAULT 0 CHECK (co2_saved_kg >= 0),
    status VARCHAR(30) DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    route_polyline JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.delivery_stops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id UUID NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    stop_sequence INT NOT NULL CHECK (stop_sequence >= 1),
    stop_type VARCHAR(20) NOT NULL CHECK (stop_type IN ('pickup', 'dropoff', 'hub')),
    location_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(100) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    cargo_quantity_kg NUMERIC(10, 2) NOT NULL CHECK (cargo_quantity_kg >= 0),
    estimated_arrival TIMESTAMPTZ,
    actual_arrival TIMESTAMPTZ,
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'arrived', 'completed', 'skipped')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. AGMARKNET MARKET PRICES (Real Mandi Benchmark Data)
CREATE TABLE IF NOT EXISTS public.market_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    commodity VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    market_name VARCHAR(255) NOT NULL,
    modal_price_per_kg NUMERIC(10, 2) NOT NULL CHECK (modal_price_per_kg > 0),
    min_price_per_kg NUMERIC(10, 2) NOT NULL CHECK (min_price_per_kg > 0),
    max_price_per_kg NUMERIC(10, 2) NOT NULL CHECK (max_price_per_kg > 0),
    price_date DATE NOT NULL,
    source VARCHAR(50) DEFAULT 'AGMARKNET (agmarknet.gov.in)',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. DEMAND FORECASTS (AI ML Engine Outputs)
CREATE TABLE IF NOT EXISTS public.demand_forecasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crop_id UUID NOT NULL REFERENCES public.crops(id) ON DELETE CASCADE,
    district VARCHAR(100) NOT NULL,
    forecast_date DATE NOT NULL,
    predicted_demand_index NUMERIC(6, 2) NOT NULL CHECK (predicted_demand_index >= 0),
    trend VARCHAR(20) NOT NULL CHECK (trend IN ('increasing', 'stable', 'decreasing', 'highly_volatile')),
    confidence_score NUMERIC(5, 2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
    recommended_action TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title_en VARCHAR(255) NOT NULL,
    title_hi VARCHAR(255) NOT NULL,
    body_en TEXT NOT NULL,
    body_hi TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('order_update', 'buyer_match', 'price_alert', 'demand_insight', 'payment_success')),
    link_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES for fast lookup
CREATE INDEX IF NOT EXISTS idx_listings_farmer ON public.crop_listings(farmer_id);
CREATE INDEX IF NOT EXISTS idx_listings_crop_status ON public.crop_listings(crop_id, status);
CREATE INDEX IF NOT EXISTS idx_requirements_buyer ON public.buyer_requirements(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_buyer ON public.orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_farmer ON public.orders(farmer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_market_prices_commodity ON public.market_prices(commodity, state, district);
CREATE INDEX IF NOT EXISTS idx_forecasts_crop_district ON public.demand_forecasts(crop_id, district);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyer_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: Public can read, user can update self
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Farmer Profiles: Public viewable, owned by farmer
CREATE POLICY "Farmer profiles are viewable by everyone" ON public.farmer_profiles FOR SELECT USING (true);
CREATE POLICY "Farmers can update own farm profile" ON public.farmer_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Farmers can insert own farm profile" ON public.farmer_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Buyer Profiles: Public viewable, owned by buyer
CREATE POLICY "Buyer profiles are viewable by everyone" ON public.buyer_profiles FOR SELECT USING (true);
CREATE POLICY "Buyers can update own buyer profile" ON public.buyer_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Buyers can insert own buyer profile" ON public.buyer_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Crop Listings: Active listings readable by anyone; modifications only by the owner
CREATE POLICY "Anyone can view active crop listings" ON public.crop_listings FOR SELECT USING (status = 'active' OR auth.uid() = farmer_id);
CREATE POLICY "Farmers can insert their own listings" ON public.crop_listings FOR INSERT WITH CHECK (auth.uid() = farmer_id);
CREATE POLICY "Farmers can update their own listings" ON public.crop_listings FOR UPDATE USING (auth.uid() = farmer_id);
CREATE POLICY "Farmers can delete their own listings" ON public.crop_listings FOR DELETE USING (auth.uid() = farmer_id);

-- Buyer Requirements: Viewable by all, editable only by buyer
CREATE POLICY "Requirements are viewable by authenticated users" ON public.buyer_requirements FOR SELECT USING (true);
CREATE POLICY "Buyers can insert own requirements" ON public.buyer_requirements FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Buyers can update own requirements" ON public.buyer_requirements FOR UPDATE USING (auth.uid() = buyer_id);

-- Orders: Only buyer, farmer, and admin can access their orders
CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = farmer_id);
CREATE POLICY "Buyers can create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Participants can update order state" ON public.orders FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() = farmer_id);

-- Payments: Only order participants can view payment records
CREATE POLICY "Order participants can view payments" ON public.payments FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = payments.order_id AND (orders.buyer_id = auth.uid() OR orders.farmer_id = auth.uid()))
);

-- Notifications: Users only see their own notifications
CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
