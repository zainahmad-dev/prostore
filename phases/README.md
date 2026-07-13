# Prostore — Remaining Work, Phased

This tracks what's left to build, based on reading the actual codebase on 2026-07-13
(not the original course/tutorial plan). Each phase is a self-contained folder with
a single `PHASE.md` describing goal, current state, tasks, and acceptance criteria.

Work through them in order — later phases assume earlier ones are done.

## Phases

| # | Phase | Why this order |
|---|-------|-----------------|
| 1 | [Admin Access Control](./phase-1-admin-access-control/PHASE.md) | Security gap: `/admin/products` has no guard. Fix before building more admin pages. |
| 2 | [Product Management Completion](./phase-2-product-management/PHASE.md) | Product edit page is a dead link; image upload is half-wired. Finish before catalog/search work. |
| 3 | [Catalog Search & Filtering](./phase-3-catalog-search/PHASE.md) | `query`/`category` params exist but do nothing; no search UI. |
| 4 | [Payment Gateway Integration](./phase-4-payment-integration/PHASE.md) | Biggest gap — PayPal/Stripe are selectable but not implemented; only COD works. |
| 5 | [Admin User Management](./phase-5-user-management/PHASE.md) | No way for an admin to promote/manage users without Prisma Studio. |
| 6 | [Reviews & Ratings](./phase-6-reviews-ratings/PHASE.md) | `rating`/`numReviews` fields exist but nothing populates them. |
| 7 | [Account & Notifications](./phase-7-account-notifications/PHASE.md) | Nice-to-have: full profile edit, order confirmation emails. |

## How to use this

Tell me which phase to start, and we'll implement it fully (schema changes, actions,
UI, and a manual test pass) before moving to the next one. Each `PHASE.md` will get
checked off item by item as we go — update it in place rather than creating new docs.
