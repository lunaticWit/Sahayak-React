import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { fetchMandiPrices } from '../src/lib/agmarknet';
import { getDemandForecast } from '../src/lib/forecasting';
import { calculateSupplyDemandMatch } from '../src/lib/matching';
import { INITIAL_LISTINGS, INITIAL_ORDERS, MANDI_PRICES } from '../src/lib/mockData';
import { optimizeLogisticsRoute } from '../src/lib/route_optimizer';
import {
  createRazorpayOrder,
  verifyRazorpaySignature,
  verifyWebhookSignature,
} from '../src/lib/razorpay';

dotenv.config({ path: '.env.local' });

const app = express();
const port = Number(process.env.PORT || 4000);
const processedWebhookIds = new Set<string>();

app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || true }));
app.use((_request, response, next) => {
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('X-Frame-Options', 'DENY');
  response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Unexpected server error';

app.get('/health', (_request, response) => {
  response.json({ status: 'healthy', service: 'Sahayak React API', version: '1.0.0' });
});

app.get('/api/agmarknet', async (request, response) => {
  try {
    const prices = await fetchMandiPrices({
      commodity: request.query.commodity as string | undefined,
      state: request.query.state as string | undefined,
      district: request.query.district as string | undefined,
    });
    response.json({
      success: true,
      source: 'AGMARKNET (agmarknet.gov.in)',
      timestamp: new Date().toISOString(),
      count: prices.length,
      data: prices,
    });
  } catch (error) {
    response.status(500).json({ success: false, error: errorMessage(error) });
  }
});

app.post('/api/ai/forecast', express.json(), async (request, response) => {
  try {
    const {
      commodity = 'Tomato',
      district = 'Nashik',
      current_price = 28,
      days_ahead = 7,
    } = request.body;
    response.json(
      await getDemandForecast(commodity, district, Number(current_price), Number(days_ahead)),
    );
  } catch (error) {
    response.status(500).json({ success: false, error: errorMessage(error) });
  }
});

app.post('/api/ai/optimize-route', express.json(), async (request, response) => {
  try {
    response.json(await optimizeLogisticsRoute(request.body));
  } catch (error) {
    response.status(500).json({ success: false, error: errorMessage(error) });
  }
});

app.post('/api/ai/assistant', express.json(), (request, response) => {
  const query = String(request.body.query || '').toLowerCase();
  let intent: 'price_inquiry' | 'demand_forecast' | 'order_status' | 'crop_advice' | 'general' = 'general';
  let responseEn = '';
  let responseHi = '';
  let actionUrl = '/marketplace';

  if (query.includes('tomato') || query.includes('टमाटर')) {
    intent = 'price_inquiry';
    const mandi = MANDI_PRICES.find((price) => price.commodity === 'Tomato');
    responseEn = `Current Agmarknet benchmark for Tomato in Lasalgaon Mandi is ₹${mandi?.modal_price_per_kg || 25}/kg (Range: ₹${mandi?.min_price_per_kg || 20}-₹${mandi?.max_price_per_kg || 28}/kg). High buyer demand (+14.5%) projected for the next 7 days in Mumbai & Pune.`;
    responseHi = `लासलगांव मंडी में टमाटर का वर्तमान औसत भाव ₹${mandi?.modal_price_per_kg || 25}/किग्रा है। मुंबई और पुणे क्षेत्र में अगले 7 दिनों में मांग में +14.5% वृद्धि का अनुमान है।`;
    actionUrl = '/insights';
  } else if (query.includes('wheat') || query.includes('गेहूँ')) {
    intent = 'price_inquiry';
    const mandi = MANDI_PRICES.find((price) => price.commodity === 'Wheat');
    responseEn = `Wheat modal rate is trading at ₹${mandi?.modal_price_per_kg || 32}/kg across Sehore & Khanna mandis. Bulk food processors are posting forward procurement tenders on Sahayak.`;
    responseHi = `सीहोर व खन्ना मंडी में गेहूँ का औसत भाव ₹${mandi?.modal_price_per_kg || 32}/किग्रा है। थोक फ्लोर मिलें सहायक प्लेटफ़ॉर्म पर अग्रिम मांग दर्ज कर रही हैं।`;
    actionUrl = '/marketplace';
  } else if (query.includes('order') || query.includes('ऑर्डर') || query.includes('delivery')) {
    intent = 'order_status';
    const latestOrder = INITIAL_ORDERS[0];
    responseEn = `Order #${latestOrder.order_number} (${latestOrder.crop_name_en}, ${latestOrder.quantity_kg} kg) status: ${latestOrder.status.toUpperCase()}. Consolidated on Route #12.`;
    responseHi = `ऑर्डर #${latestOrder.order_number} (${latestOrder.crop_name_hi}, ${latestOrder.quantity_kg} किग्रा) की स्थिति: ${latestOrder.status.toUpperCase()}। समन्वित रूट #12 पर प्रस्थान हो चुका है।`;
    actionUrl = '/orders';
  } else {
    responseEn = 'Sahayak agricultural network: Connecting 1,200+ farmers directly with retailers, providing Agmarknet transparent benchmarks and 24.5% cheaper consolidated VRP transport.';
    responseHi = 'सहायक कृषि नेटवर्क: 1200+ किसानों को सीधे खरीदारों से जोड़ता है, पारदर्शी मंडी भाव प्रदान करता है और समन्वित परिवहन से 24.5% भाड़ा बचाता है।';
    actionUrl = '/';
  }

  response.json({
    success: true,
    query,
    intent,
    response_en: responseEn,
    response_hi: responseHi,
    action_url: actionUrl,
    timestamp: new Date().toISOString(),
  });
});

const listingSchema = z.object({
  farmer_id: z.string().min(1),
  crop_id: z.string().min(1),
  variety: z.string().min(1),
  quantity_available_kg: z.number().positive(),
  minimum_order_kg: z.number().positive().default(1),
  price_per_kg: z.number().positive(),
  harvest_date: z.string(),
  grade: z.enum(['Grade A', 'Grade B', 'Grade C', 'Organic Certified', 'Standard']),
  organic_certified: z.boolean().default(false),
  quality_description: z.string().optional(),
});

app.get('/api/listings', (request, response) => {
  const category = request.query.category as string | undefined;
  const query = (request.query.q as string | undefined)?.toLowerCase();
  let listings = [...INITIAL_LISTINGS];

  if (category && category !== 'all') {
    listings = listings.filter((listing) => listing.category === category);
  }
  if (query) {
    listings = listings.filter(
      (listing) =>
        listing.crop_name_en.toLowerCase().includes(query) ||
        listing.crop_name_hi.toLowerCase().includes(query) ||
        listing.variety.toLowerCase().includes(query),
    );
  }
  response.json({ success: true, count: listings.length, listings });
});

app.post('/api/listings', express.json(), (request, response) => {
  try {
    const listing = listingSchema.parse(request.body);
    response.status(201).json({
      success: true,
      listing: {
        id: `l-${Date.now()}`,
        ...listing,
        status: 'active',
        created_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    response.status(400).json({
      success: false,
      error: error instanceof z.ZodError ? error.issues : 'Invalid listing payload',
    });
  }
});

app.post('/api/matching', express.json(), (request, response) => {
  try {
    const { requirement, listings = INITIAL_LISTINGS } = request.body;
    if (!requirement) {
      response.status(400).json({ success: false, error: 'Requirement is required' });
      return;
    }
    const matches = listings
      .map((listing: (typeof INITIAL_LISTINGS)[number]) =>
        calculateSupplyDemandMatch(requirement, listing),
      )
      .sort(
        (
          a: ReturnType<typeof calculateSupplyDemandMatch>,
          b: ReturnType<typeof calculateSupplyDemandMatch>,
        ) => b.match_score - a.match_score,
      );
    response.json({
      success: true,
      requirement_id: requirement.id,
      total_matches: matches.length,
      matches,
    });
  } catch (error) {
    response.status(500).json({ success: false, error: errorMessage(error) });
  }
});

const orderCreateSchema = z.object({
  buyer_id: z.string().min(1),
  farmer_id: z.string().min(1),
  listing_id: z.string().min(1),
  quantity_kg: z.number().positive(),
  unit_price: z.number().positive(),
  delivery_address: z.string().min(3),
  delivery_lat: z.number(),
  delivery_lng: z.number(),
});

app.get('/api/orders', (request, response) => {
  const buyerId = request.query.buyer_id;
  const farmerId = request.query.farmer_id;
  let orders = [...INITIAL_ORDERS];
  if (typeof buyerId === 'string') orders = orders.filter((order) => order.buyer_id === buyerId);
  if (typeof farmerId === 'string') orders = orders.filter((order) => order.farmer_id === farmerId);
  response.json({ success: true, count: orders.length, orders });
});

app.post('/api/orders', express.json(), (request, response) => {
  try {
    const order = orderCreateSchema.parse(request.body);
    const subtotal = order.quantity_kg * order.unit_price;
    const platformFee = Math.round(subtotal * 0.015);
    const deliveryFee = 250;
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    response.status(201).json({
      success: true,
      order: {
        id: `ord-${Date.now()}`,
        order_number: `SHK-2026-${randomSuffix}`,
        ...order,
        total_amount: subtotal + platformFee + deliveryFee,
        platform_fee: platformFee,
        delivery_fee: deliveryFee,
        status: 'pending',
        payment_status: 'pending',
        delivery_otp: String(Math.floor(1000 + Math.random() * 9000)),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    response.status(400).json({
      success: false,
      error: error instanceof z.ZodError ? error.issues : 'Invalid order creation payload',
    });
  }
});

app.post('/api/payments/webhook', express.text({ type: '*/*' }), (request, response) => {
  try {
    const rawBody = request.body as string;
    const signature = request.get('x-razorpay-signature') || '';
    if (!verifyWebhookSignature(rawBody, signature)) {
      response.status(400).json({ success: false, error: 'Invalid webhook signature' });
      return;
    }

    const event = JSON.parse(rawBody);
    const eventId = event.id || `evt_${Date.now()}`;
    if (processedWebhookIds.has(eventId)) {
      response.json({ success: true, message: 'Event already processed' });
      return;
    }
    processedWebhookIds.add(eventId);
    response.json({
      success: true,
      received: true,
      event_id: eventId,
      processed_at: new Date().toISOString(),
    });
  } catch (error) {
    response.status(500).json({ success: false, error: errorMessage(error) });
  }
});

app.post('/api/payments/razorpay-order', express.json(), async (request, response) => {
  const schema = z.object({
    amount: z.number().positive(),
    currency: z.string().default('INR'),
    receipt: z.string().optional(),
    notes: z.record(z.string()).optional(),
  });
  try {
    const body = schema.parse(request.body);
    const order = await createRazorpayOrder({
      amountInPaisa: Math.round(body.amount * 100),
      currency: body.currency,
      receipt: body.receipt || `rcpt_${Date.now()}`,
      notes: body.notes,
    });
    response.json(order);
  } catch (error) {
    response.status(400).json({
      success: false,
      error: error instanceof z.ZodError ? error.issues : 'Failed to create Razorpay order',
    });
  }
});

app.post('/api/payments/razorpay-verify', express.json(), (request, response) => {
  const schema = z.object({
    orderId: z.string().min(1),
    paymentId: z.string().min(1),
    signature: z.string().min(1),
  });
  try {
    const body = schema.parse(request.body);
    if (!verifyRazorpaySignature(body)) {
      response.status(400).json({
        success: false,
        verified: false,
        error: 'Cryptographic signature mismatch',
      });
      return;
    }
    response.json({
      success: true,
      verified: true,
      orderId: body.orderId,
      paymentId: body.paymentId,
      verified_at: new Date().toISOString(),
    });
  } catch (error) {
    response.status(400).json({
      success: false,
      verified: false,
      error: error instanceof z.ZodError ? error.issues : errorMessage(error),
    });
  }
});

const buildDirectory = path.resolve(process.cwd(), 'dist');
if (existsSync(buildDirectory)) {
  app.use(express.static(buildDirectory));
  app.get('*', (_request, response) => {
    response.sendFile(path.join(buildDirectory, 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`Sahayak React API listening on http://localhost:${port}`);
});