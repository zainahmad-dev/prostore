# Phase 6 — Reviews & Ratings

## Goal
Users can leave a written review + star rating on a product they've purchased, and
the product's `rating`/`numReviews` reflect real submitted reviews instead of being
static defaults.

## Current state (verified)
- `prisma/schema.prisma`: `Product.rating` (`Decimal @default(0)`) and
  `Product.numReviews` (`Int @default(0)`) exist, but **there is no `Review` model**
  and nothing ever updates these two fields after product creation.
- No review UI anywhere in `app/(root)/product/[slug]/page.tsx` or
  `components/shared/product/`.
- No review-related entries in `lib/validator.ts`.

## Tasks
- [x] Add a `Review` model to `prisma/schema.prisma`: `id`, `userId`, `productId`,
      `rating` (Int, 1-5), `title`, `description`, `isVerifiedPurchase` (Boolean),
      `createdAt`; relations to `User` and `Product`. Run a migration.
- [x] Add `reviewFormSchema`/`insertReviewSchema` to `lib/validator.ts`.
- [x] Add server actions: `createUpdateReview`, `getReviews(productId)`,
      `getReviewByProductId` (current user's own review, for edit).
- [x] After a review is created/updated, recalculate and persist the product's
      `rating` (average) and `numReviews` (count) — likely in the same transaction.
- [x] Build the UI: review list + average rating display on the product page, a
      "Write a review" form/dialog gated to signed-in users (optionally: only users
      who've purchased the product — check `OrderItem` for a matching `productId`).

## Acceptance criteria
- [x] A signed-in user can submit a star rating + written review on a product page.
- [x] The product's displayed average rating and review count update immediately after
  a new review is submitted.
- [x] A user can edit their own existing review but not someone else's.

## Implementation notes
- `userId`+`productId` has a DB unique constraint; `createUpdateReview` upserts on
  it, so re-submitting edits in place rather than creating duplicates.
- `isVerifiedPurchase` is computed server-side from a paid `OrderItem` match, not
  user-supplied. Any signed-in user can review (not gated to purchasers) — the
  badge just reflects whether they actually bought it.
- Verified end-to-end with Playwright against the dev server: sign in, create a
  review (rating/count update immediately), reopen the dialog (confirmed prefill),
  edit and resubmit (updates in place, no duplicate), sign out (review still
  visible, form replaced by a sign-in prompt). No console errors.
