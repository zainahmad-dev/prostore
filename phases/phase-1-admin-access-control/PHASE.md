# Phase 1 — Admin Access Control

## Goal
Every `/admin/*` route and every admin-only server action is guarded consistently,
so a non-admin (or logged-out) user can't reach or mutate admin data.

## Current state (verified)
- `lib/auth-guard.ts` exports `requireAdmin()` and is used in:
  - `app/admin/overview/page.tsx`
  - `app/admin/orders/page.tsx`
  - `app/admin/products/create/page.tsx`
- **Not guarded:**
  - `app/admin/products/page.tsx` (the products list) — no `requireAdmin()` call
  - Server actions in `lib/actions/product.actions.ts` (`createProduct`, `updateProduct`,
    `deleteProduct`) and `lib/actions/order.action.ts` (`deleteOrder`, `deliverOrder`,
    `updateOrderToPaidCOD`, `getAllOrders`) — these only check session in a couple of
    places (e.g. via the page), not inside the action itself. If someone calls the
    action directly (e.g. from devtools), there's no server-side role check.
  - `middleware.ts` is a no-op — it matches almost every route but always calls
    `NextResponse.next()`. No redirect for unauthenticated/non-admin users.

## Tasks
- [x] Add `await requireAdmin();` to `app/admin/products/page.tsx`.
- [x] Add a role check inside every admin-only server action itself (not just the
      calling page), so the action is safe even if called directly.
      `requireAdmin()` now runs before the `try` block in `createProduct`,
      `updateProduct`, `deleteProduct` (`lib/actions/product.actions.ts`) and
      `getAllOrders`, `deleteOrder`, `updateOrderToPaidCOD`, `deliverOrder`
      (`lib/actions/order.action.ts`) — placed before `try` so the redirect thrown
      by `requireAdmin()` isn't swallowed by the surrounding `catch`.
- [x] Decided: implemented edge middleware in addition to per-page/per-action checks
      (defense in depth). `middleware.ts` uses `next-auth/jwt`'s `getToken()` to read
      the session JWT directly (no Prisma import, stays edge-safe) and redirects
      unauthenticated requests to `/sign-in` and non-admins away from `/admin/*` to
      `/unauthorized`, scoped via matcher to `/admin/:path*` and `/user/:path*`.
- [x] Confirmed `/user/*` routes: `getMyOrders` and `updateProfile` were already
      scoped to `session.user.id`, no changes needed. Found and fixed a real gap
      while spot-checking: `app/(root)/order/[id]/page.tsx` had **no auth check at
      all** — any visitor who knew/guessed an order id could view its shipping
      address and contents. Added a session + ownership check (owner or admin only,
      `notFound()` otherwise).

## Acceptance criteria
- [x] Visiting `/admin/products` while logged out or as a non-admin redirects/blocks
      (verified: logged-out → 307 to `/sign-in`, non-admin → 307 to `/unauthorized`).
- [x] Calling any admin server action as a non-admin returns an error, not data.
- [x] No regression: existing admin flows (create/edit/delete product & order) still
      work for an actual admin user (verified admin can still reach
      `/admin/products` and `/admin/orders`, 200 OK).
