"""
Sahayak AI/ML Service - Intelligent Supply-Demand Matching Engine
Evaluates listings against buyer requirements using weighted multi-variable criteria.
"""

from typing import List, Dict, Any
import math

class MatchingEngine:
    """
    Intelligent matcher computing transparent match scores between agricultural supply and demand.
    """

    @staticmethod
    def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        r = 6371.0
        phi1 = math.radians(lat1)
        phi2 = math.radians(lat2)
        dphi = math.radians(lat2 - lat1)
        dlambda = math.radians(lon2 - lon1)
        a = math.sin(dphi / 2.0) ** 2 + math.cos(phi1) * math.cos(phi2) * (math.sin(dlambda / 2.0) ** 2)
        return round(r * 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a)), 1)

    @classmethod
    def calculate_match(
        cls,
        requirement: Dict[str, Any],
        listing: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Calculate match score between a buyer requirement and a farmer listing.
        Weights:
        - Distance (35%)
        - Price (30%)
        - Quantity Fulfillment (20%)
        - Farmer Reliability / Quality Grade (15%)
        """
        # 1. Distance score (Max score within 50km, decays smoothly up to 300km)
        dist_km = cls.haversine(
            requirement.get("delivery_lat", 19.0760),
            requirement.get("delivery_lng", 73.0083),
            listing.get("latitude", 20.1983),
            listing.get("longitude", 73.8344)
        )
        if dist_km <= 30.0:
            dist_score = 100.0
        elif dist_km <= 150.0:
            dist_score = 100.0 - ((dist_km - 30.0) / 120.0) * 20.0
        elif dist_km <= 400.0:
            dist_score = 80.0 - ((dist_km - 150.0) / 250.0) * 40.0
        else:
            dist_score = max(10.0, 40.0 - ((dist_km - 400.0) / 600.0) * 30.0)

        # 2. Price score
        max_budget = requirement.get("max_price_per_kg", 30.0)
        asking_price = listing.get("price_per_kg", 28.0)
        if asking_price <= max_budget:
            savings_pct = (max_budget - asking_price) / max_budget
            price_score = min(100.0, 90.0 + savings_pct * 50.0)
        else:
            over_pct = (asking_price - max_budget) / max_budget
            price_score = max(0.0, 90.0 - over_pct * 200.0)

        # 3. Quantity fulfillment
        req_qty = requirement.get("quantity_requested_kg", 500.0)
        avail_qty = listing.get("quantity_available_kg", 800.0)
        if avail_qty >= req_qty:
            qty_score = 100.0
        else:
            qty_score = max(20.0, (avail_qty / req_qty) * 90.0)

        # 4. Quality & Farmer Trust score
        grade = listing.get("grade", "Grade A")
        farmer_rating = listing.get("farmer_rating", 4.8)
        base_trust = (farmer_rating / 5.0) * 100.0
        grade_multiplier = 1.0 if "Grade A" in grade or "Organic" in grade else (0.85 if "Grade B" in grade else 0.70)
        trust_score = base_trust * grade_multiplier

        # Composite weighted score
        final_score = (
            (dist_score * 0.35) +
            (price_score * 0.30) +
            (qty_score * 0.20) +
            (trust_score * 0.15)
        )
        final_score = round(min(99.0, max(10.0, final_score)), 1)

        # Reasons breakdown
        reasons = []
        if dist_km <= 150.0:
            reasons.append(f"Located within nearby transport corridor ({dist_km} km)")
        if asking_price <= max_budget:
            reasons.append(f"Priced at ₹{asking_price}/kg (within budget of ₹{max_budget}/kg)")
        if avail_qty >= req_qty:
            reasons.append(f"Can fulfill 100% of required volume ({avail_qty} kg available vs {req_qty} kg requested)")
        else:
            reasons.append(f"Can fulfill {round((avail_qty/req_qty)*100)}% of requirement ({avail_qty} kg)")
        if "Organic" in grade:
            reasons.append("Organic certified produce with zero synthetic chemicals")

        return {
            "listing_id": listing.get("id"),
            "farmer_name": listing.get("farmer_name", "Patil Farms"),
            "fpo_name": listing.get("fpo_name"),
            "crop_name": listing.get("crop_name", "Tomato"),
            "variety": listing.get("variety", "Hybrid Red"),
            "match_score": final_score,
            "distance_km": dist_km,
            "asking_price": asking_price,
            "max_budget": max_budget,
            "quantity_available_kg": avail_qty,
            "quantity_requested_kg": req_qty,
            "fulfillment_percentage": min(100.0, round((avail_qty / req_qty) * 100.0, 1)),
            "score_breakdown": {
                "distance_score": round(dist_score, 1),
                "price_score": round(price_score, 1),
                "quantity_score": round(qty_score, 1),
                "trust_score": round(trust_score, 1)
            },
            "reasons": reasons
        }
