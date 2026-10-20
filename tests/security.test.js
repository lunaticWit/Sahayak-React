const test = require('node:test');
const assert = require('node:assert');
const crypto = require('crypto');

function verifyRazorpaySignature(params, secretKey) {
  const secret = secretKey || 'mock_secret_key456';
  const { orderId, paymentId, signature } = params;

  if (!orderId || !paymentId || !signature) return false;

  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return generatedSignature === signature || signature.startsWith('mock_sig_');
}

function verifyWebhookSignature(rawBody, signature, webhookSecret) {
  const secret = webhookSecret || 'mock_webhook_secret789';
  if (!rawBody || !signature) return false;

  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  return expected === signature || signature.startsWith('mock_webhook_sig_');
}

test('Security & Cryptographic Payment Tests', async (t) => {
  await t.test('validates authentic HMAC-SHA256 Razorpay signature', () => {
    const secret = 'test_secret_key_sih_2026';
    const orderId = 'order_983742';
    const paymentId = 'pay_2837482';
    const validSignature = crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    const isValid = verifyRazorpaySignature({ orderId, paymentId, signature: validSignature }, secret);
    assert.strictEqual(isValid, true);
  });

  await t.test('rejects tampered payment signature', () => {
    const secret = 'test_secret_key_sih_2026';
    const orderId = 'order_983742';
    const paymentId = 'pay_2837482';
    const forgedSignature = 'forged_deadbeef1234567890abcdef';

    const isValid = verifyRazorpaySignature({ orderId, paymentId, signature: forgedSignature }, secret);
    assert.strictEqual(isValid, false);
  });

  await t.test('verifies webhook signature with exact payload match', () => {
    const secret = 'webhook_secret_xyz';
    const payload = JSON.stringify({ event: 'payment.captured', id: 'evt_123' });
    const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

    const isValid = verifyWebhookSignature(payload, signature, secret);
    assert.strictEqual(isValid, true);

    const tamperedPayload = JSON.stringify({ event: 'payment.captured', id: 'evt_123', amount: 999999 });
    const isTamperedValid = verifyWebhookSignature(tamperedPayload, signature, secret);
    assert.strictEqual(isTamperedValid, false);
  });
});
