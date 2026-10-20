-- Sahayak: Smart Agricultural Marketplace (SIH 2026 PS 33)
-- 002_seed_demo_data.sql
-- Seed realistic Indian agricultural data for SIH judging demonstration

-- 1. CROPS CATALOG
INSERT INTO public.crops (id, name_en, name_hi, category, shelf_life_days, standard_unit, image_url) VALUES
('c1111111-1111-1111-1111-111111111111', 'Hybrid Tomato (Nashik Red)', 'टमाटर (नासिक लाल)', 'vegetable', 7, 'kg', 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop'),
('c2222222-2222-2222-2222-222222222222', 'Sharbati Wheat (Grade A)', 'शरबती गेहूँ (ग्रेड ए)', 'grain', 365, 'quintal', 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&auto=format&fit=crop'),
('c3333333-3333-3333-3333-333333333333', 'Nashik Red Onion', 'नासिक लाल प्याज', 'vegetable', 45, 'kg', 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=500&auto=format&fit=crop'),
('c4444444-4444-4444-4444-444444444444', 'Kolar Fresh Potato (Jyoti)', 'कोलार आलू (ज्योति)', 'vegetable', 60, 'kg', 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&auto=format&fit=crop'),
('c5555555-5555-5555-5555-555555555555', 'Pusa Basmati 1121 Rice', 'पूसा बासमती चावल', 'grain', 730, 'quintal', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop'),
('c6666666-6666-6666-6666-666666666666', 'Organic Green Cauliflower', 'फूलगोभी (ऑर्गेनिक)', 'vegetable', 6, 'kg', 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=500&auto=format&fit=crop')
ON CONFLICT (id) DO NOTHING;

-- 2. USER PROFILES
INSERT INTO public.profiles (id, role, full_name, phone, language_preference) VALUES
('f1111111-0000-0000-0000-000000000001', 'farmer', 'Ramesh Kumar Patil', '+91 98230 45678', 'hi'),
('f1111111-0000-0000-0000-000000000002', 'fpo', 'Godavari Valley Kisan Producer Co.', '+91 94222 12345', 'mr'),
('f1111111-0000-0000-0000-000000000003', 'farmer', 'Gurpreet Singh', '+91 98140 76543', 'pa'),
('b1111111-0000-0000-0000-000000000001', 'bulk_buyer', 'FreshMart Supermarkets (Mumbai Hub)', '+91 98200 99881', 'en'),
('b1111111-0000-0000-0000-000000000002', 'bulk_buyer', 'Taj Agro Processing Industries', '+91 99300 44332', 'en'),
('b1111111-0000-0000-0000-000000000003', 'consumer', 'Priya Deshmukh', '+91 97654 32100', 'en'),
('d1111111-0000-0000-0000-000000000001', 'logistics_driver', 'Suresh Shinde (Sahayak Fleet)', '+91 93210 55443', 'hi'),
('a1111111-0000-0000-0000-000000000001', 'admin', 'Sahayak Platform Operations', '+91 80000 12345', 'en')
ON CONFLICT (id) DO NOTHING;

-- 3. FARMER / FPO PROFILES
INSERT INTO public.farmer_profiles (id, farm_name, fpo_name, farm_size_acres, state, district, village, pincode, latitude, longitude, is_verified, rating, total_sales_kg) VALUES
('f1111111-0000-0000-0000-000000000001', 'Patil Organic Farms', 'Nashik Vegetable Growers FPO', 6.5, 'Maharashtra', 'Nashik', 'Dindori', '422202', 20.1983, 73.8344, true, 4.9, 14200),
('f1111111-0000-0000-0000-000000000002', 'Godavari Agro Hub', 'Godavari Valley Kisan Producer Co.', 120.0, 'Maharashtra', 'Nashik', 'Niphad', '422303', 20.0886, 74.1118, true, 4.8, 89000),
('f1111111-0000-0000-0000-000000000003', 'Kisan Kalyan Farm', 'Punjab Grain Collective', 25.0, 'Punjab', 'Ludhiana', 'Khanna', '141401', 30.7046, 76.2217, true, 4.95, 45000)
ON CONFLICT (id) DO NOTHING;

-- 4. BUYER PROFILES
INSERT INTO public.buyer_profiles (id, buyer_type, organization_name, gstin, delivery_address, state, district, pincode, latitude, longitude) VALUES
('b1111111-0000-0000-0000-000000000001', 'retailer', 'FreshMart Supermarkets Pvt Ltd', '27AABCF1234F1Z5', 'Plot 44, APMC Market Sector 19, Vashi, Navi Mumbai', 'Maharashtra', 'Thane', '400705', 19.0760, 73.0083),
('b1111111-0000-0000-0000-000000000002', 'processor', 'Taj Agro Processing Ltd', '27AAACT5678K1Z2', 'G-12, MIDC Industrial Area, Dombivli East', 'Maharashtra', 'Thane', '421201', 19.2183, 73.0867),
('b1111111-0000-0000-0000-000000000003', 'consumer', 'Priya Deshmukh', NULL, 'Flat 402, Green Meadows, Baner, Pune', 'Maharashtra', 'Pune', '411045', 18.5590, 73.7868)
ON CONFLICT (id) DO NOTHING;

-- 5. CROP LISTINGS
INSERT INTO public.crop_listings (id, farmer_id, crop_id, variety, quantity_available_kg, minimum_order_kg, price_per_kg, harvest_date, grade, organic_certified, quality_description, status) VALUES
('l1111111-0000-0000-0000-000000000001', 'f1111111-0000-0000-0000-000000000001', 'c1111111-1111-1111-1111-111111111111', 'Abhinav Hybrid Red', 1500.00, 20.00, 28.00, CURRENT_DATE - INTERVAL '1 day', 'Grade A', true, 'Naturally ripened, firm texture, ideal for retail display and extended shelf-life.', 'active'),
('l1111111-0000-0000-0000-000000000002', 'f1111111-0000-0000-0000-000000000002', 'c3333333-3333-3333-3333-333333333333', 'Garwa Red Onion', 4000.00, 50.00, 24.50, CURRENT_DATE - INTERVAL '2 days', 'Grade A', false, 'Cured, dry outer skin, uniform 55mm+ size, highly resistant to transit moisture.', 'active'),
('l1111111-0000-0000-0000-000000000003', 'f1111111-0000-0000-0000-000000000003', 'c2222222-2222-2222-2222-222222222222', 'MP Sharbati Gold', 12000.00, 100.00, 36.00, CURRENT_DATE - INTERVAL '5 days', 'Grade A', true, 'Premium golden grain, high protein content, sorted and machine cleaned.', 'active'),
('l1111111-0000-0000-0000-000000000004', 'f1111111-0000-0000-0000-000000000001', 'c6666666-6666-6666-6666-666666666666', 'Snowball Organic', 600.00, 10.00, 32.00, CURRENT_DATE, 'Grade A', true, 'Zero pesticide organic certified, compact white curds fresh harvested today.', 'active')
ON CONFLICT (id) DO NOTHING;

-- 6. BUYER REQUIREMENTS
INSERT INTO public.buyer_requirements (id, buyer_id, crop_id, variety_preference, quantity_requested_kg, max_price_per_kg, required_by_date, delivery_address, delivery_lat, delivery_lng, status) VALUES
('r1111111-0000-0000-0000-000000000001', 'b1111111-0000-0000-0000-000000000001', 'c1111111-1111-1111-1111-111111111111', 'Hybrid Red Grade A', 800.00, 30.00, CURRENT_DATE + INTERVAL '2 days', 'Vashi APMC Central Depot, Navi Mumbai', 19.0760, 73.0083, 'open'),
('r1111111-0000-0000-0000-000000000002', 'b1111111-0000-0000-0000-000000000002', 'c3333333-3333-3333-3333-333333333333', 'Nashik Red 50mm+', 2500.00, 26.00, CURRENT_DATE + INTERVAL '3 days', 'Dombivli Processing Plant, MIDC', 19.2183, 73.0867, 'open')
ON CONFLICT (id) DO NOTHING;

-- 7. MATCHES (AI scored)
INSERT INTO public.matches (id, requirement_id, listing_id, match_score, distance_km, score_breakdown, status) VALUES
('m1111111-0000-0000-0000-000000000001', 'r1111111-0000-0000-0000-000000000001', 'l1111111-0000-0000-0000-000000000001', 94.50, 142.00, '{"price_compatibility": 98.0, "distance_efficiency": 91.0, "quantity_fulfillment": 100.0, "farmer_trust_rating": 98.0}', 'suggested')
ON CONFLICT (id) DO NOTHING;

-- 8. AGMARKNET MANDI BENCHMARK PRICES
INSERT INTO public.market_prices (commodity, state, district, market_name, modal_price_per_kg, min_price_per_kg, max_price_per_kg, price_date, source) VALUES
('Tomato', 'Maharashtra', 'Nashik', 'Nashik APMC Mandi', 25.00, 21.00, 29.00, CURRENT_DATE, 'AGMARKNET (agmarknet.gov.in)'),
('Tomato', 'Maharashtra', 'Nashik', 'Lasalgaon Mandi', 24.50, 20.00, 28.00, CURRENT_DATE, 'AGMARKNET (agmarknet.gov.in)'),
('Tomato', 'Maharashtra', 'Mumbai', 'Vashi APMC Mandi', 32.00, 26.00, 36.00, CURRENT_DATE, 'AGMARKNET (agmarknet.gov.in)'),
('Onion', 'Maharashtra', 'Nashik', 'Lasalgaon Mandi', 22.00, 18.00, 25.50, CURRENT_DATE, 'AGMARKNET (agmarknet.gov.in)'),
('Onion', 'Maharashtra', 'Nashik', 'Pimpalgaon Mandi', 21.50, 17.50, 25.00, CURRENT_DATE, 'AGMARKNET (agmarknet.gov.in)'),
('Wheat', 'Madhya Pradesh', 'Sehore', 'Sehore Mandi', 32.00, 28.00, 35.00, CURRENT_DATE, 'AGMARKNET (agmarknet.gov.in)'),
('Potato', 'Karnataka', 'Kolar', 'Kolar Mandi', 18.50, 15.00, 22.00, CURRENT_DATE, 'AGMARKNET (agmarknet.gov.in)')
ON CONFLICT (id) DO NOTHING;

-- 9. DEMAND FORECASTS (AI ML Models)
INSERT INTO public.demand_forecasts (crop_id, district, forecast_date, predicted_demand_index, trend, confidence_score, recommended_action) VALUES
('c1111111-1111-1111-1111-111111111111', 'Nashik', CURRENT_DATE + INTERVAL '7 days', 114.50, 'increasing', 92.00, 'Festive demand surge detected in Mumbai & Thane corridor. FPOs are advised to prepare +10% to +15% additional harvest capacity to capitalize on peak prices.'),
('c3333333-3333-3333-3333-333333333333', 'Nashik', CURRENT_DATE + INTERVAL '7 days', 103.20, 'stable', 88.50, 'Steady export and domestic retail demand. Maintain regular harvest and storage curing practices.'),
('c2222222-2222-2222-2222-222222222222', 'Ludhiana', CURRENT_DATE + INTERVAL '7 days', 108.00, 'increasing', 95.00, 'Flour mills and institutional processors booking forward contracts. FPOs can lock minimum pricing at ₹35/kg+.')
ON CONFLICT (id) DO NOTHING;

-- 10. SAMPLE DEMO LOGISTICS ROUTE
INSERT INTO public.routes (id, route_code, vehicle_type, vehicle_capacity_kg, total_distance_km, estimated_duration_mins, fuel_saving_percentage, co2_saved_kg, status) VALUES
('r0000000-0000-0000-0000-000000000001', 'ROUTE-MH-NSK-MUM-12', 'Electric Pickup Truck', 2500.00, 142.00, 260, 24.50, 48.20, 'planned')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.delivery_stops (route_id, stop_sequence, stop_type, location_name, contact_person, contact_phone, latitude, longitude, cargo_quantity_kg, status) VALUES
('r0000000-0000-0000-0000-000000000001', 1, 'pickup', 'Patil Organic Farms, Dindori', 'Ramesh Patil', '+91 98230 45678', 20.1983, 73.8344, 800.00, 'pending'),
('r0000000-0000-0000-0000-000000000001', 2, 'pickup', 'Godavari Agro Hub, Niphad', 'Sanjay Jadhav', '+91 94222 12345', 20.0886, 74.1118, 1200.00, 'pending'),
('r0000000-0000-0000-0000-000000000001', 3, 'hub', 'Sahayak Agri Logistics Hub, Thane', 'Thane Yard Lead', '+91 98980 11223', 19.2183, 73.0867, 0.00, 'pending'),
('r0000000-0000-0000-0000-000000000001', 4, 'dropoff', 'FreshMart Vashi APMC Depot', 'Warehouse Incharge', '+91 98200 99881', 19.0760, 73.0083, 800.00, 'pending'),
('r0000000-0000-0000-0000-000000000001', 5, 'dropoff', 'Taj Agro Processing MIDC', 'Procurement Officer', '+91 99300 44332', 19.2183, 73.0867, 1200.00, 'pending')
ON CONFLICT DO NOTHING;
