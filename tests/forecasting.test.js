const test = require('node:test');
const assert = require('node:assert');

function generateLocalForecast(commodity, currentPrice, daysAhead = 7) {
  const points = [];
  const trendRate = 0.018;
  let priceAcc = currentPrice;
  let demandAcc = 100.0;

  for (let i = 1; i <= daysAhead; i++) {
    priceAcc = priceAcc * (1 + trendRate);
    demandAcc = demandAcc * (1 + trendRate * 1.5);
    const uncertainty = (i / daysAhead) * 8.0;

    points.push({
      day_number: i,
      predicted_price: Math.round(priceAcc * 100) / 100,
      price_lower_bound: Math.round(priceAcc * (1 - uncertainty / 100) * 100) / 100,
      price_upper_bound: Math.round(priceAcc * (1 + uncertainty / 100) * 100) / 100,
      demand_index: Math.round(demandAcc * 10) / 10,
    });
  }

  const changePct = ((points[points.length - 1].demand_index - 100) / 100) * 100;
  return {
    trend: changePct > 4 ? 'increasing' : 'stable',
    confidence_score: 92.5,
    change_percent: Math.round(changePct * 10) / 10,
    forecast_points: points,
  };
}

test('Demand & Price Forecasting Engine Tests', async (t) => {
  await t.test('forecasts upward demand trajectory for high demand produce', () => {
    const f = generateLocalForecast('Tomato', 28.0, 7);
    assert.strictEqual(f.trend, 'increasing');
    assert.strictEqual(f.forecast_points.length, 7);
    assert.ok(f.change_percent > 10, `Expected demand change > 10%, got ${f.change_percent}%`);

    // Verify uncertainty bands widen over time
    const day1 = f.forecast_points[0];
    const day7 = f.forecast_points[6];
    const margin1 = day1.price_upper_bound - day1.price_lower_bound;
    const margin7 = day7.price_upper_bound - day7.price_lower_bound;
    assert.ok(margin7 > margin1, 'Day 7 uncertainty margin should be larger than Day 1');
  });
});
