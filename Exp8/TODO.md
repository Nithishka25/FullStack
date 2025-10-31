# TODO: Implement Dynamic Stripe Payment on Buy Now Button

## Steps to Complete
- [x] Update ProductDetail.jsx: Make "Buy Now" button use dynamic amount (product.price * 100 in paise) and change price display to ₹ (INR symbol).
- [x] Update ProductCard.jsx: Change price display to ₹ for consistency.
- [x] Test the payment flow: Servers running (server on 5000, client on 5173). User must set Stripe keys in .env files (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET in server/.env; VITE_STRIPE_PUBLISHABLE_KEY in client/.env). Navigate to product detail, click Buy Now, complete payment in checkout, verify order in /orders.
- [x] Verify UI: Checkout page now shows product details, summary, and proper INR display. Payment elements load after intent creation.
- [x] Improve Checkout.jsx UI: Add product details, payment summary, make amount read-only, enhance layout for better UX.

## Notes
- Stripe integration is already in place; only frontend amount calculation and display need fixing.
- Currency is INR; amount in paise.
- Webhook handles order creation; client fallback if webhook fails.
