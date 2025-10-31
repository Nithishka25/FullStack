import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/client';
import { toast } from 'react-hot-toast';

// do not initialize Stripe at module scope to prevent IntegrationError when key is missing

function InnerCheckout() {
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState('');
  const [status, setStatus] = useState('');
  const [creating, setCreating] = useState(false);
  const [paying, setPaying] = useState(false);
  const [done, setDone] = useState(false);
  const [searchParams] = useSearchParams();

  const amount = useMemo(() => Number(searchParams.get('amount') || 0), [searchParams]);
  const productId = useMemo(() => searchParams.get('productId') || '', [searchParams]);
  const [formAmount, setFormAmount] = useState(amount);

  async function ensureIntent() {
    if (clientSecret) return true;
    setStatus('');
    const paise = Number(formAmount);
    if (!paise || Number.isNaN(paise) || paise <= 0) {
      setStatus('Enter a valid amount (in paise)');
      return false;
    }
    try {
      setCreating(true);
      const res = await api.post('/api/payments/intent', { amount: paise, currency: 'inr', metadata: { productId } });
      setClientSecret(res.data.clientSecret);
      return true;
    } catch (e) {
      setStatus(e.response?.data?.error || 'Failed to create intent');
      return false;
    } finally {
      setCreating(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!stripe || !elements) return;
    try {
      setPaying(true);
      const ok = await ensureIntent();
      if (!ok) return;
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
        confirmParams: { return_url: window.location.origin + '/products' },
      });
      if (error) {
        setStatus(error.message || 'Payment failed');
      } else if (paymentIntent?.status === 'succeeded') {
        setStatus('Payment successful');
        setDone(true);
        try {
          // Fallback: create order client-side if webhook not set
          await api.post('/api/orders', { productId, amount: Number(formAmount), paymentIntentId: paymentIntent.id });
        } catch (_) {
          // ignore if fails; webhook may handle it
        }
      } else {
        setStatus('Payment processing');
      }
    } finally {
      setPaying(false);
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-800 rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Checkout (INR)</h2>
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount (in paise)</label>
        <input
          className="w-full rounded-md border border-gray-300 focus:border-brand focus:ring-brand bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100"
          type="number"
          min={1}
          value={formAmount || ''}
          onChange={(e) => setFormAmount(Number(e.target.value))}
          placeholder="e.g. 100 (₹1)"
        />
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {clientSecret ? <PaymentElement /> : <div className="text-sm text-gray-600">A payment method element will appear after you click Make Payment.</div>}
        {!done ? (
          <button type="submit" disabled={creating || paying} className="rounded-md bg-green-600 text-white px-4 py-2 hover:bg-green-700 disabled:opacity-50">
            {creating ? 'Preparing…' : paying ? 'Processing…' : 'Make Payment'}
          </button>
        ) : (
          <a href="/orders" className="inline-block rounded-md bg-brand text-white px-4 py-2 hover:bg-brand-dark">Go to Orders</a>
        )}
      </form>

      {status && <div className="mt-4 text-sm text-gray-700 dark:text-gray-300">{status}</div>}
    </div>
  );
}

export default function Checkout() {
  const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
  if (!publishableKey) {
    return (
      <div className="max-w-md mx-auto bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Checkout (INR)</h2>
        <div className="text-sm text-red-600">
          Stripe publishable key is not configured. Set <code>VITE_STRIPE_PUBLISHABLE_KEY</code> in <code>client/.env</code>, restart the dev server, and reload.
        </div>
      </div>
    );
  }
  const stripePromise = loadStripe(publishableKey);
  return (
    <Elements stripe={stripePromise} options={{ appearance: {}, loader: 'auto' }}>
      <InnerCheckout />
    </Elements>
  );
}
