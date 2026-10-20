import { BuyerRequirement, CropListing, MatchResult } from '@/types';
import { calculateHaversineDistance } from '@/lib/utils';

export function calculateSupplyDemandMatch(
  requirement: BuyerRequirement,
  listing: CropListing
): MatchResult {
  // 1. Distance score (35% weight)
  const distKm = calculateHaversineDistance(
    requirement.delivery_lat,
    requirement.delivery_lng,
    listing.latitude,
    listing.longitude
  );

  let distScore = 100;
  if (distKm <= 30) {
    distScore = 100;
  } else if (distKm <= 150) {
    distScore = 100 - ((distKm - 30) / 120) * 20;
  } else if (distKm <= 400) {
    distScore = 80 - ((distKm - 150) / 250) * 40;
  } else {
    distScore = Math.max(10, 40 - ((distKm - 400) / 600) * 30);
  }

  // 2. Price score (30% weight)
  let priceScore = 0;
  if (listing.price_per_kg <= requirement.max_price_per_kg) {
    const savingsRatio = (requirement.max_price_per_kg - listing.price_per_kg) / requirement.max_price_per_kg;
    priceScore = Math.min(100, 90 + savingsRatio * 50);
  } else {
    const overRatio = (listing.price_per_kg - requirement.max_price_per_kg) / requirement.max_price_per_kg;
    priceScore = Math.max(0, 90 - overRatio * 200);
  }

  // 3. Quantity fulfillment (20% weight)
  let qtyScore = 0;
  if (listing.quantity_available_kg >= requirement.quantity_requested_kg) {
    qtyScore = 100;
  } else {
    qtyScore = Math.max(20, (listing.quantity_available_kg / requirement.quantity_requested_kg) * 90);
  }

  // 4. Trust & Quality (15% weight)
  const baseTrust = (listing.farmer_rating / 5.0) * 100;
  const gradeMultiplier = listing.grade === 'Grade A' || listing.organic_certified ? 1.0 : (listing.grade === 'Grade B' ? 0.85 : 0.7);
  const trustScore = baseTrust * gradeMultiplier;

  const totalScore = Math.round(
    ((distScore * 0.35 + priceScore * 0.30 + qtyScore * 0.20 + trustScore * 0.15) * 10) / 10
  );

  const reasons: string[] = [];
  if (distKm <= 160) reasons.push(`Direct transport corridor access (${distKm} km)`);
  if (listing.price_per_kg <= requirement.max_price_per_kg) {
    reasons.push(`Asking ₹${listing.price_per_kg}/kg (within budget of ₹${requirement.max_price_per_kg}/kg)`);
  }
  if (listing.quantity_available_kg >= requirement.quantity_requested_kg) {
    reasons.push(`Can supply 100% of requirement (${listing.quantity_available_kg} kg available)`);
  } else {
    const pct = Math.round((listing.quantity_available_kg / requirement.quantity_requested_kg) * 100);
    reasons.push(`Can fulfill ${pct}% of bulk volume (${listing.quantity_available_kg} kg)`);
  }
  if (listing.organic_certified) {
    reasons.push('Organic certified with zero chemical residue guarantee');
  }

  return {
    listing_id: listing.id,
    farmer_name: listing.farmer_name,
    fpo_name: listing.fpo_name,
    crop_name: listing.crop_name_en,
    variety: listing.variety,
    match_score: Math.min(99, Math.max(10, totalScore)),
    distance_km: distKm,
    asking_price: listing.price_per_kg,
    max_budget: requirement.max_price_per_kg,
    quantity_available_kg: listing.quantity_available_kg,
    quantity_requested_kg: requirement.quantity_requested_kg,
    fulfillment_percentage: Math.min(100, Math.round((listing.quantity_available_kg / requirement.quantity_requested_kg) * 100)),
    score_breakdown: {
      distance_score: Math.round(distScore),
      price_score: Math.round(priceScore),
      quantity_score: Math.round(qtyScore),
      trust_score: Math.round(trustScore),
    },
    reasons,
  };
}
