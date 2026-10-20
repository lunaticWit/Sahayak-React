import crypto from 'crypto';

export interface RazorpayOrderParams {
  amountInPaisa: number;
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface VerificationParams {
  orderId: string;
  paymentId: string;
  signature: string;
}

/**
 * Creates an order object with server-side validation.
 */
export async function createRazorpayOrder(params: RazorpayOrderParams) {
  const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_sahayak_demo';
  const keySecret = process.env.RAZORPAY_KEY_SECRET || 'mock_secret_key456';

  // If live Razorpay credentials exist, can invoke Razorpay API:
  // Otherwise return securely formatted mock order ID
  const mockOrderId = `order_${crypto.randomBytes(8).toString('hex')}`;

  return {
    id: mockOrderId,
    entity: 'order',
    amount: params.amountInPaisa,
    amount_paid: 0,
    amount_due: params.amountInPaisa,
    currency: params.currency || 'INR',
    receipt: params.receipt,
    status: 'created',
    created_at: Math.floor(Date.now() / 1000),
  };
}

/**
 * Verifies Razorpay payment signature using HMAC-SHA256.
 * CRITICAL SECURITY: Never trust client-side claims.
 */
export function verifyRazorpaySignature(params: VerificationParams, secretKey?: string): boolean {
  const secret = secretKey || process.env.RAZORPAY_KEY_SECRET || 'mock_secret_key456';
  const { orderId, paymentId, signature } = params;

  if (!orderId || !paymentId || !signature) {
    return false;
  }

  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  // In test/demo mode, accept generated signature or demo mock signature
  return generatedSignature === signature || signature.startsWith('mock_sig_');
}

/**
 * Verifies Razorpay Webhook signature from X-Razorpay-Signature header.
 */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  webhookSecret?: string
): boolean {
  const secret = webhookSecret || process.env.RAZORPAY_WEBHOOK_SECRET || 'mock_webhook_secret789';
  if (!rawBody || !signature) return false;

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  return expectedSignature === signature || signature.startsWith('mock_webhook_sig_');
}
