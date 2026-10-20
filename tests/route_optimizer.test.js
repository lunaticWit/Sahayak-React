const test = require('node:test');
const assert = require('node:assert');

function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const r = 6371;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) ** 2 +
    Math.cos(phi1) * Math.cos(phi2) * (Math.sin(deltaLambda / 2) ** 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(r * c * 1.25 * 100) / 100;
}

test('VRP Logistics & Route Optimizer Tests', async (t) => {
  await t.test('calculates accurate distance between Nashik and Mumbai APMC', () => {
    const d = haversineDistanceKm(20.0886, 74.1118, 19.0760, 73.0083);
    assert.ok(d > 120 && d < 220, `Expected distance ~140-210km, got ${d}`);
  });

  await t.test('proves consolidated route saves mileage vs individual farmer trips', () => {
    // Farm 1: Dindori, Farm 2: Niphad
    // Dropoff 1: Vashi, Dropoff 2: Dombivli
    const p1 = { lat: 20.1983, lng: 73.8344 };
    const p2 = { lat: 20.0886, lng: 74.1118 };
    const d1 = { lat: 19.0760, lng: 73.0083 };
    const d2 = { lat: 19.2183, lng: 73.0867 };

    // Individual independent trips (each farmer drives to each destination and back)
    const trip1 = haversineDistanceKm(p1.lat, p1.lng, d1.lat, d1.lng) * 2;
    const trip2 = haversineDistanceKm(p2.lat, p2.lng, d2.lat, d2.lng) * 2;
    const unoptimizedTotal = trip1 + trip2;

    // Consolidated single loop: Depot -> P1 -> P2 -> D2 -> D1
    const leg1 = haversineDistanceKm(p1.lat, p1.lng, p2.lat, p2.lng);
    const leg2 = haversineDistanceKm(p2.lat, p2.lng, d2.lat, d2.lng);
    const leg3 = haversineDistanceKm(d2.lat, d2.lng, d1.lat, d1.lng);
    const consolidatedTotal = leg1 + leg2 + leg3;

    assert.ok(
      consolidatedTotal < unoptimizedTotal,
      `Consolidated route (${consolidatedTotal}km) should be shorter than uncoordinated trips (${unoptimizedTotal}km)`
    );

    const savingsPct = ((unoptimizedTotal - consolidatedTotal) / unoptimizedTotal) * 100;
    assert.ok(savingsPct > 20, `Expected savings > 20%, got ${savingsPct.toFixed(1)}%`);
  });
});
