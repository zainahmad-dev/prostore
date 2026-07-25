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
- [x] Decide on an email provider. **Chosen: Resend + React Email.** Added
      `resend` + `@react-email/components`. `lib/email/index.ts` sends via Resend
      when `RESEND_API_KEY` is set and otherwise logs the email to the server
      console (so local dev works with no account/cost). Env documented in
      `.env.example` (`RESEND_API_KEY`, `EMAIL_SENDER`).
- [x] Add an order-confirmation email sent on successful `createOrder`, and a
      payment-confirmation email sent when an order transitions to paid
      (`updateOrderToPaidCOD`). Templates: `lib/email/templates/*`. Email failures
      are caught and logged — they never break order placement or the paid update.
- [x] Extend `updateProfile` to support email change and add password change.
      **Email change is password-gated** (confirm current password + uniqueness
      check) rather than the heavier double-opt-in re-verification flow; the DB
      remains the source of truth and the JWT/session is refreshed with the new
      email/name on save. Password change (`updatePassword`) mirrors `signUpUser`
      hashing (`compareSync` current password, then `hashSync` the new one).
- [ ] (Optional) Account deletion / data export for the signed-in user — **skipped
      for this pass** by decision; can be a later follow-up.

## Acceptance criteria
- [x] Placing an order sends the buyer a confirmation email (rendered template
      verified; falls back to a console log when no Resend key is configured).
- [x] A user can change their password from `/user/profile` without contacting
      support (new "Change Password" form + `updatePassword` action).
