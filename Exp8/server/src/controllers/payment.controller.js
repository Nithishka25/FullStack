import Stripe from 'stripe';
import { Order } from '../models/Order.js';

export async function createPaymentIntent(req, res) {
  try {
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) {
      console.error('[payments] Missing STRIPE_SECRET_KEY. Set it in server/.env');
      return res.status(400).json({ error: 'Stripe is not configured. Set STRIPE_SECRET_KEY in server/.env and restart the server.' });
    }
    const stripe = new Stripe(secret, { apiVersion: '2024-06-20' });
    const { amount, currency = 'usd', metadata = {} } = req.body;
    if (!amount) return res.status(400).json({ error: 'amount required (in smallest currency unit, e.g., cents)' });

    const intent = await stripe.paymentIntents.create({
      amount: Number(amount),
      currency,
      metadata: {
        ...metadata,
        buyerId: req.user.id,
      },
      automatic_payment_methods: { enabled: true },
    });

    res.json({ clientSecret: intent.client_secret });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Stripe error' });
  }
}

export async function stripeWebhook(req, res) {
  try {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event = req.body; // when using express.raw, this will be a Buffer

    if (webhookSecret) {
      const secret = process.env.STRIPE_SECRET_KEY;
      if (!secret) {
        return res.status(500).send('Stripe not configured');
      }
      const stripeInstance = new Stripe(secret, { apiVersion: '2024-06-20' });
      // req.body is a Buffer because express.raw({ type: 'application/json' }) is used
      event = stripeInstance.webhooks.constructEvent(req.body, sig, webhookSecret);
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        try {
          const pi = event.data.object;
          const { amount, currency, id: paymentIntentId, metadata } = pi;
          const buyerId = metadata?.buyerId;
          const productId = metadata?.productId;
          if (buyerId && productId) {
            await Order.create({ buyer: buyerId, product: productId, amount, currency, status: 'paid', paymentIntentId });
          }
        } catch (e) {
          console.error('Order creation error', e);
        }
        break;
      case 'payment_intent.payment_failed':
        // Optionally persist failed status
        break;
      default:
        break;
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
}
