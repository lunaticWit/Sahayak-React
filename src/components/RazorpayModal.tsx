'use client';

import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, X, Lock, CreditCard, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { CropListing } from '@/types';
import { formatINR } from '@/lib/utils';

interface RazorpayModalProps {
  listing?: CropListing;
  quantityKg?: number;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function RazorpayModal({
  listing,
  quantityKg = 50,
  onClose,
  onSuccess,
}: RazorpayModalProps) {
  const { language, t } = useLanguage();
  const { currentUser, createOrder } = useAuth();
  const { clearCart } = useCart();

  const [paymentStage, setPaymentStage] = useState<'review' | 'processing' | 'verifying' | 'success' | 'failed'>('review');
  const [paymentId, setPaymentId] = useState('');
  const [createdOrderNumber, setCreatedOrderNumber] = useState('');

  const unitPrice = listing?.price_per_kg || 28.0;
  const subtotal = unitPrice * quantityKg;
  const platformFee = Math.round(subtotal * 0.015);
  const deliveryFee = 250;
  const totalAmount = subtotal + platformFee + deliveryFee;

  const handleInitiatePayment = async () => {
    setPaymentStage('processing');

    try {
      // Step 1: Server-side Razorpay Order Creation
      const rzpRes = await fetch('/api/payments/razorpay-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalAmount,
          currency: 'INR',
          receipt: `rcpt_${Date.now()}`,
        }),
      });

      const rzpOrder = await rzpRes.json();
      const mockOrderId = rzpOrder.id || `order_rzp_${Date.now()}`;
      const mockPaymentId = `pay_${Date.now()}_sim`;
      const mockSignature = `mock_sig_${Date.now()}`;

      // Simulate payment authorization delay
      setTimeout(async () => {
        setPaymentStage('verifying');

        // Step 2: Server-side Signature Verification
        const verifyRes = await fetch('/api/payments/razorpay-verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: mockOrderId,
            paymentId: mockPaymentId,
            signature: mockSignature,
          }),
        });

        const verifyData = await verifyRes.json();

        if (verifyData.verified) {
          // Step 3: Create Order Record in DB/Context
          const newOrd = createOrder({
            buyer_id: currentUser.id,
            buyer_name: currentUser.full_name,
            buyer_phone: currentUser.phone,
            farmer_id: listing?.farmer_id || 'f1111111-0000-0000-0000-000000000001',
            farmer_name: listing?.farmer_name || 'Ramesh Patil',
            fpo_name: listing?.fpo_name || 'Nashik Vegetable Growers FPO',
            listing_id: listing?.id || 'l1111111-0000-0000-0000-000000000001',
            crop_name_en: listing?.crop_name_en || 'Hybrid Tomato',
            crop_name_hi: listing?.crop_name_hi || 'हाइब्रिड टमाटर',
            variety: listing?.variety || 'Abhinav Red Hybrid',
            quantity_kg: quantityKg,
            unit_price: unitPrice,
            total_amount: totalAmount,
            platform_fee: platformFee,
            delivery_fee: deliveryFee,
            delivery_address: 'Plot 44, APMC Market Sector 19, Vashi, Navi Mumbai',
            delivery_lat: 19.0760,
            delivery_lng: 73.0083,
            status: 'confirmed',
            payment_status: 'captured',
            delivery_otp: String(Math.floor(1000 + Math.random() * 9000)),
            notes: 'Purchased directly via Sahayak marketplace.',
          });

          setPaymentId(mockPaymentId);
          setCreatedOrderNumber(newOrd.order_number);
          setPaymentStage('success');
          clearCart();

          if (onSuccess) {
            onSuccess();
          }
        } else {
          setPaymentStage('failed');
        }
      }, 1400);
    } catch {
      setPaymentStage('failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="bg-agri-dark text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <Lock className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base">Razorpay Secure Checkout</h3>
              <p className="text-[10px] text-gray-300">256-Bit Encrypted Agricultural Escrow</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {paymentStage === 'review' && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-2.5 text-xs text-gray-700">
                <div className="flex justify-between">
                  <span className="text-gray-500">Produce:</span>
                  <strong className="text-gray-900 font-bold">
                    {language === 'hi' ? listing?.crop_name_hi : listing?.crop_name_en} ({listing?.variety})
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Quantity:</span>
                  <strong className="text-gray-900 font-bold">{quantityKg} kg</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Farmer FPO:</span>
                  <strong className="text-agri-primary font-bold">{listing?.farmer_name}</strong>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between">
                  <span className="text-gray-500">Produce Subtotal:</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Logistics & Consolidated Transit:</span>
                  <span>₹{deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Platform Fee (1.5%):</span>
                  <span>₹{platformFee.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between text-base font-extrabold text-agri-dark">
                  <span>Total Payable:</span>
                  <span className="text-agri-accent">{formatINR(totalAmount)}</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    className="p-2.5 rounded-xl border border-agri-primary bg-agri-subtle text-xs font-bold text-agri-dark flex flex-col items-center gap-1 ring-1 ring-agri-primary"
                  >
                    <CreditCard className="w-4 h-4 text-agri-primary" />
                    <span>UPI / QR</span>
                  </button>
                  <button
                    type="button"
                    className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-medium text-gray-700 flex flex-col items-center gap-1"
                  >
                    <CreditCard className="w-4 h-4 text-gray-500" />
                    <span>NetBanking</span>
                  </button>
                  <button
                    type="button"
                    className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-medium text-gray-700 flex flex-col items-center gap-1"
                  >
                    <CreditCard className="w-4 h-4 text-gray-500" />
                    <span>Kisan Card</span>
                  </button>
                </div>
              </div>

              <button
                onClick={handleInitiatePayment}
                className="w-full py-3.5 bg-agri-primary hover:bg-agri-dark text-white rounded-xl text-sm font-extrabold flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.01]"
              >
                <span>Pay {formatINR(totalAmount)} via Razorpay</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Payment is held in Escrow until produce delivery is verified by OTP</span>
              </div>
            </div>
          )}

          {(paymentStage === 'processing' || paymentStage === 'verifying') && (
            <div className="py-12 text-center space-y-4">
              <Loader2 className="w-10 h-10 text-agri-primary animate-spin mx-auto" />
              <div>
                <p className="font-extrabold text-base text-gray-900">
                  {paymentStage === 'processing' ? 'Processing Payment...' : 'Verifying Razorpay Signature (HMAC-SHA256)...'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Validating server-side transaction idempotency & cryptographic hash
                </p>
              </div>
            </div>
          )}

          {paymentStage === 'success' && (
            <div className="py-6 text-center space-y-4 animate-in fade-in">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              </div>
              <div>
                <h4 className="text-xl font-extrabold text-gray-900">Payment Verified & Confirmed!</h4>
                <p className="text-xs text-gray-600 mt-1">
                  Order <strong>{createdOrderNumber}</strong> created successfully.
                </p>
                <p className="text-[11px] text-gray-400 font-mono mt-0.5">Razorpay Payment ID: {paymentId}</p>
              </div>

              <div className="bg-emerald-50 rounded-2xl p-3 border border-emerald-200 text-xs text-emerald-800 text-left space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Farmer Notified for Harvesting & Pickup
                </p>
                <p className="text-[11px]">
                  Produce will be consolidated into Morning Route #12. Track your order in the Orders tab.
                </p>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 bg-agri-primary hover:bg-agri-dark text-white rounded-xl text-xs font-bold transition-colors"
              >
                Go to Order Tracker
              </button>
            </div>
          )}

          {paymentStage === 'failed' && (
            <div className="py-6 text-center space-y-4">
              <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-extrabold text-gray-900">Payment Verification Failed</h4>
                <p className="text-xs text-gray-600 mt-1">
                  Cryptographic signature mismatch or transaction was cancelled.
                </p>
              </div>
              <button
                onClick={() => setPaymentStage('review')}
                className="w-full py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
