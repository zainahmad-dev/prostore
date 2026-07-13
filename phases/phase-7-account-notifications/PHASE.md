# Phase 7 — Account & Notifications

## Goal
Round out account self-service and close the loop on order confirmation — lower
priority than Phases 1-6, tackle once the core flows are solid.

## Current state (verified)
- `lib/actions/user.actions.ts` → `updateProfile` only updates `name`. Email and
  password changes aren't implemented (email is the unique login identifier via
  `signInFormSchema`, so changing it needs care — likely re-verification).
- No email-sending library anywhere in the project (checked for Resend, Nodemailer,
  React Email — none present, no relevant env vars in `.env.example`).
- No order-confirmation or payment-confirmation email is sent from `createOrder`
  or the payment-capture flow (Phase 4).

## Tasks
- [ ] Decide on an email provider (Resend is common with Next.js + React Email
      templates; confirm with user before adding a dependency/cost).
- [ ] Add an order-confirmation email sent on successful `createOrder`, and a
      payment-confirmation email sent when an order transitions to paid.
- [ ] Extend `updateProfile` to support email change (with re-verification, since
      `User.email` is unique and used for credential sign-in) and password change
      (current password confirmation + `hashSync`, mirroring `signUpUser`).
- [ ] (Optional) Account deletion / data export for the signed-in user.

## Acceptance criteria
- Placing an order sends the buyer a confirmation email.
- A user can change their password from `/user/profile` without contacting support.
