"""
Sahayak AI/ML Microservice - FastAPI Main Entrypoint
Exposes AI endpoints for agricultural demand forecasting, VRP route optimization, and supply-demand matching.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import os

from forecasting import DemandForecaster
from route_optimizer import RouteOptimizer
from matching_engine import MatchingEngine

app = FastAPI(
    title="Sahayak Agricultural Intelligence Service",
    description="AI/ML Microservice for SIH 2026 Problem Statement 33 - Demand Forecasting, Route Optimization & Direct Farmer-Buyer Matching",
    version="1.0.0"
)

# Enable CORS for the React web application
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get(
        "CORS_ORIGINS", "http://localhost:5173,http://localhost:4000"
    ).split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- REQUEST / RESPONSE SCHEMAS -----------------

class ForecastRequest(BaseModel):
    commodity: str = Field(..., example="Tomato")
    district: str = Field(..., example="Nashik")
    current_price: float = Field(..., example=28.0)
    historical_prices: Optional[List[float]] = Field(default=None, example=[24.0, 25.5, 26.0, 27.0, 28.0])
    days_ahead: int = Field(default=7, ge=1, le=30)

class NodeModel(BaseModel):
    id: Optional[str] = None
    location_name: str
    contact_person: Optional[str] = "Contact"
    contact_phone: Optional[str] = ""
    latitude: float
    longitude: float
    quantity_kg: Optional[float] = 0.0

class RouteOptimizationRequest(BaseModel):
    depot: NodeModel
    pickups: List[NodeModel]
    dropoffs: List[NodeModel]
    vehicle_capacity_kg: Optional[float] = 2500.0
    average_speed_kmh: Optional[float] = 40.0

class MatchRequest(BaseModel):
    requirement: Dict[str, Any]
    listings: List[Dict[str, Any]]

# ----------------- API ENDPOINTS -----------------

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Sahayak AI/ML Service",
        "version": "1.0.0",
        "supported_models": ["DemandForecaster", "RouteOptimizerVRP", "MultiFactorMatching"]
    }

@app.post("/api/forecast")
def api_forecast(req: ForecastRequest):
    try:
        result = DemandForecaster.generate_forecast(
            commodity=req.commodity,
            district=req.district,
            current_price=req.current_price,
            historical_prices=req.historical_prices,
            days_ahead=req.days_ahead
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Forecasting error: {str(e)}")

@app.post("/api/optimize-route")
def api_optimize_route(req: RouteOptimizationRequest):
    try:
        pickups_dict = [p.model_dump() for p in req.pickups]
        dropoffs_dict = [d.model_dump() for d in req.dropoffs]
        depot_dict = req.depot.model_dump()
        
        result = RouteOptimizer.optimize_logistics_run(
            depot=depot_dict,
            pickups=pickups_dict,
            dropoffs=dropoffs_dict,
            vehicle_capacity_kg=req.vehicle_capacity_kg,
            average_speed_kmh=req.average_speed_kmh
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Route optimization error: {str(e)}")

@app.post("/api/match")
def api_match(req: MatchRequest):
    try:
        matches = []
        for listing in req.listings:
            scored = MatchingEngine.calculate_match(
                requirement=req.requirement,
                listing=listing
            )
            matches.append(scored)
        
        # Sort descending by match score
        matches.sort(key=lambda x: x["match_score"], reverse=True)
        return {
            "requirement_id": req.requirement.get("id"),
            "total_candidates": len(req.listings),
            "matched_listings": matches
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Matching calculation error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
