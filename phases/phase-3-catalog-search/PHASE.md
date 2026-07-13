# Phase 3 — Catalog Search & Filtering

## Goal
Users can actually search and filter products; admins can search the product/order
tables from the UI (not just by editing the URL).

## Current state (verified)
- `lib/actions/product.actions.ts` → `getAllProducts({ query, limit, page, category })`
  accepts `query` and `category` but **the Prisma query never uses them** — it always
  returns all products ordered by `createdAt desc`. Compare with `getAllOrders`, which
  *does* build a `queryFilter` from its `query` param — same pattern needs to be
  applied here.
- `components/shared/header/index.tsx` has no search input at all, just logo + `Menu`.
- `app/admin/layout.tsx` has a commented-out `<AdminSearch />` import and usage —
  the component doesn't exist yet.
- No sort control (price, rating, newest) anywhere.

## Tasks
- [x] Implement real filtering in `getAllProducts`: `query` → `name`/`description`
      `contains` (insensitive), `category` → exact match, following the
      `Prisma.OrderWhereInput` pattern already used in `getAllOrders`.
- [x] Add a search input to the main site header that submits to a search results
      route (`/search?q=...&category=...`), reusing `getAllProducts`.
- [x] Add a category filter (sidebar) — derived from distinct `Product.category`
      values via new `getAllCategories` (`prisma.product.groupBy`).
- [x] Build `components/admin/admin-search.tsx` and re-enable it in `app/admin/layout.tsx`.
- [x] Add a sort param (price asc/desc, rating, newest) on `/search`.

## Acceptance criteria
- Typing a product name into the header search returns matching products.
- Filtering by category on the products/search page narrows results.
- Admin search bar filters the admin products table by name.
