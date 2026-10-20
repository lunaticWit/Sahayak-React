const test = require('node:test');
const assert = require('node:assert');

// Haversine distance calculator
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 1.2 * 10) / 10;
}

// Multi-factor matching function
function calculateSupplyDemandMatch(requirement, listing) {
  const distKm = calculateHaversineDistance(
    requirement.delivery_lat,
    requirement.delivery_lng,
    listing.latitude,
    listing.longitude
  );

  let distScore = 100;
  if (distKm <= 30) distScore = 100;
  else if (distKm <= 150) distScore = 100 - ((distKm - 30) / 120) * 20;
  else if (distKm <= 400) distScore = 80 - ((distKm - 150) / 250) * 40;
  else distScore = Math.max(10, 40 - ((distKm - 400) / 600) * 30);

  let priceScore = 0;
  if (listing.price_per_kg <= requirement.max_price_per_kg) {
    const savingsRatio = (requirement.max_price_per_kg - listing.price_per_kg) / requirement.max_price_per_kg;
    priceScore = Math.min(100, 90 + savingsRatio * 50);
  } else {
    const overRatio = (listing.price_per_kg - requirement.max_price_per_kg) / requirement.max_price_per_kg;
    priceScore = Math.max(0, 90 - overRatio * 200);
  }

  let qtyScore = 0;
  if (listing.quantity_available_kg >= requirement.quantity_requested_kg) {
    qtyScore = 100;
  } else {
    qtyScore = Math.max(20, (listing.quantity_available_kg / requirement.quantity_requested_kg) * 90);
  }

  const baseTrust = (listing.farmer_rating / 5.0) * 100;
  const gradeMultiplier = listing.grade === 'Grade A' || listing.organic_certified ? 1.0 : 0.85;
  const trustScore = baseTrust * gradeMultiplier;

  const totalScore = Math.round(
    ((distScore * 0.35 + priceScore * 0.30 + qtyScore * 0.20 + trustScore * 0.15) * 10) / 10
  );

  return {
    match_score: Math.min(99, Math.max(10, totalScore)),
    distance_km: distKm,
    fulfillment_percentage: Math.min(100, Math.round((listing.quantity_available_kg / requirement.quantity_requested_kg) * 100)),
  };
}

test('Supply-Demand Matching Engine Tests', async (t) => {
  await t.test('calculates high match for nearby farmer within budget', () => {
    const req = {
      quantity_requested_kg: 400,
      max_price_per_kg: 30,
      delivery_lat: 19.0760,
      delivery_lng: 73.0083,
    };
    const listing = {
      quantity_available_kg: 800,
      price_per_kg: 28,
      latitude: 20.1983,
      longitude: 73.8344,
      farmer_rating: 4.9,
      grade: 'Grade A',
      organic_certified: true,
    };

    const match = calculateSupplyDemandMatch(req, listing);
    assert.ok(match.match_score >= 88, `Expected match >= 88, got ${match.match_score}`);
    assert.strictEqual(match.fulfillment_percentage, 100);
    assert.ok(match.distance_km > 0 && match.distance_km < 250);
  });

  await t.test('penalizes listings over budget', () => {
    const req = {
      quantity_requested_kg: 500,
      max_price_per_kg: 25,
      delivery_lat: 19.0760,
      delivery_lng: 73.0083,
    };
    const expensiveListing = {
      quantity_available_kg: 500,
      price_per_kg: 35, // 40% over budget
      latitude: 19.1,
      longitude: 73.0,
      farmer_rating: 4.5,
      grade: 'Grade A',
      organic_certified: false,
    };

    const match = calculateSupplyDemandMatch(req, expensiveListing);
    assert.ok(match.match_score < 75, `Expected score < 75 for overpriced listing, got ${match.match_score}`);
  });
});
