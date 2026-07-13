# Phase 4 — Payment Gateway Integration

## Goal
PayPal and Stripe are real, working payment methods at checkout — not just labels
in a dropdown.

## Current state (verified)
- `lib/constants/index.ts` lists `PAYMENT_METHODS = ['PayPal', 'Stripe', 'CashOnDelivery']`
  and `DEFAULT_PAYMENT_METHOD = 'PayPal'`.
- `package.json` has **no PayPal or Stripe SDK installed** (no `@paypal/checkout-server-sdk`,
  no `stripe`, no `@stripe/stripe-js`).
- `.env` / `.env.example` have **no PayPal or Stripe keys**.
- `lib/actions/order.action.ts` `createOrder()` only special-cases
  `paymentMethod === 'CashOnDelivery'` (auto-marks paid). If a user picks PayPal or
  Stripe, the order is created as unpaid and then... nothing happens — there's no
  capture/confirm flow.
- `app/(root)/order/[id]/order-details-table.tsx` only renders Mark-as-Paid /
  Mark-as-Delivered buttons for the admin COD path. There's no PayPal button, no
  Stripe Elements/checkout form for the buyer to actually pay.
- `updateOrderToPaidCOD` in `order.action.ts` is COD-specific; there's no generic
  `updateOrderToPaid` that records a `paymentResult` (the `Order.paymentResult Json?`
  column exists in the schema but is never written to).

## Tasks
- [ ] Decide scope: implement both PayPal and Stripe, or just one first (recommend
      starting with one — PayPal is the current default).
- [ ] Add SDK + env vars (`PAYPAL_CLIENT_ID`, `PAYPAL_APP_SECRET` and/or
      `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`).
- [ ] Add server actions: create PayPal order, capture PayPal payment (or Stripe
      PaymentIntent create/confirm), writing to `Order.paymentResult` and setting
      `isPaid`/`paidAt` on success — generalize the existing COD-only update-to-paid
      logic instead of duplicating it.
- [ ] Add the buyer-facing payment UI on the order details page, conditional on
      `order.paymentMethod`.
- [ ] Handle failure/cancellation paths (declined payment, user cancels PayPal popup).
- [ ] (If using Stripe) add a webhook route for async payment confirmation.

## Acceptance criteria
- A buyer who selects PayPal (or Stripe) at checkout can complete a real payment
  (sandbox/test mode) from the order details page.
- On success, the order's `isPaid`, `paidAt`, and `paymentResult` are updated and
  reflected in both the buyer's order view and the admin orders table.
- COD orders continue to work exactly as before (no regression).
