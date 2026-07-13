# Phase 2 — Product Management Completion

## Goal
Admins can fully create and edit a product, including images, without hitting a
dead link or a missing field.

## Current state (verified)
- `app/admin/products/page.tsx` links "Edit" to `/admin/products/[id]` — **this route
  does not exist** (only `app/admin/products/create/page.tsx` exists).
- `components/admin/product-form.tsx`:
  - Has an empty `<div className="upload-field ...">` placeholder — no upload UI.
  - `defaultValues` for Update mode never include `images`, `rating`, `numReviews`,
    `isFeatured`, or `banner` — only name/slug/category/brand/description/stock/price.
  - On submit, `images` is never included in the payload sent to `createProduct`/
    `updateProduct`, but `insertProductSchema` likely requires it (check `lib/validator.ts`).
- `app/api/uploadthing/core.ts` and `route.ts` exist (uncommitted, currently untracked
  in git), and `lib/uploadthing.ts` exists — the UploadThing backend is set up but
  nothing in the UI calls it.
- `lib/actions/product.actions.ts` `createProduct`/`updateProduct` just spread
  `insertProductSchema.parse(data)` into Prisma — they'll accept `images`/`banner`
  fine once the form sends them; no action-layer change needed unless validation fails.

## Tasks
- [x] Created `app/admin/products/[id]/page.tsx` — loads the product via a new
      `getProductById(id)` in `product.actions.ts` (parallel to `getProductBySlug`,
      wrapped in `convertToPlainObject` so the Decimal/Date fields are safe to pass
      across the server/client boundary), 404s via `notFound()` if missing, and
      renders `<ProductForm type="Update" product={product} />`. Guarded with
      `requireAdmin()`.
- [x] Built the image upload field in `product-form.tsx` using `UploadButton` from
      `lib/uploadthing.ts` — supports multiple images (`form.watch('images')` drives
      a thumbnail grid), each thumbnail has an X button that removes it via
      `form.setValue`. Bumped `imageUploader` in `app/api/uploadthing/core.ts` to
      `maxFileCount: 6` (was implicitly 1).
- [x] Added an `isFeatured` checkbox (new `components/ui/checkbox.tsx` — the repo
      had no Checkbox primitive; `@radix-ui/react-checkbox` was already resolvable
      transitively via the `radix-ui` package but wasn't a direct dependency, so
      added it explicitly to `package.json`) + banner `UploadButton` that only
      renders when featured and no banner is set yet; shows a preview otherwise.
- [x] Fixed `defaultValues` in both Create and Update mode to include
      `images`/`isFeatured`/`banner`.
- [x] Uncommented `images`/`isFeatured`/`banner` in `insertProductSchema`
      (`lib/validator.ts`) — they were stubbed out, which is why Prisma would have
      rejected creates/updates (both fields are non-nullable/no-default in the
      schema).

### Bugs found while wiring this up
- `app/api/uploadthing/core.ts`'s middleware only checked for *any* session, not
  admin — any logged-in non-admin could've hit the upload endpoint directly. Now
  checks `session.user.role === 'admin'`.
- `db/sample-data.ts` had `banner: 'banner-1.jpg'` / `'banner-2.jpg'` (missing the
  `/images/` prefix the actual files live under in `public/images/`) — crashed the
  new banner `<Image>` preview with "Failed to construct 'URL': Invalid URL" the
  first time anything actually read that field. Fixed the seed data and the two
  already-seeded rows in the dev DB; also made the banner preview defensively skip
  rendering (falls back to the upload button) if the value isn't a `/`- or
  `http`-prefixed path, so bad legacy data can't crash the page again.
- `next.config.ts` only allowlisted `utfs.io` for `next/image`; UploadThing v7's
  client response uses `ufsUrl`, which resolves to `*.ufs.sh`. Added that
  `remotePatterns` entry — confirmed necessary by actually uploading a file end to
  end and seeing `next/image` reject it before the fix.

## Acceptance criteria
- [x] Clicking "Edit" on any product in `/admin/products` opens a pre-filled form
      (verified: name/slug/category/brand/price/stock/images/isFeatured all
      populated for an existing seeded product).
- [x] Creating or editing a product lets you upload one or more images via
      UploadThing and see them reflected after save (verified end-to-end: created
      a real product through the form with a live UploadThing upload, confirmed
      the resulting row in the DB has the `ufs.sh` URL in `images`, then cleaned up
      the test row).
- [x] Marking a product "Featured" toggles on a banner upload control (schema and
      UI support it; not wired into any homepage display yet since no homepage
      banner/featured section exists in the codebase — that's outside this phase).
