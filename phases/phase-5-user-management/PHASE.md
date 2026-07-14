# Phase 5 — Admin User Management

## Goal
An admin can view all users and change their role (e.g. promote to admin) from the
UI, without opening Prisma Studio.

## Current state (verified)
- `lib/actions/user.actions.ts` has: `signInwithCredentials`, `signOutUser`,
  `signUpUser`, `getUserById`, `updateUserAddress`, `updateUserPaymentMethod`,
  `updateProfile`. **No `getAllUsers`, `updateUserRole`, or `deleteUser`.**
- There is no `app/admin/users/` route at all.
- `app/admin/main-nav.tsx` should be checked for whether a "Users" nav link already
  points somewhere (likely not, but confirm before adding a duplicate).
- `User.role` is a plain `String` (`@default("user")`) — no enum constraint at the
  DB level, so validation of allowed values needs to happen in a Zod schema.

## Tasks
- [x] Add `getAllUsers({ limit, page, query })` (mirror `getAllOrders`'s pagination/
      search pattern) and `deleteUser(id)` to `lib/actions/user.actions.ts`, both
      guarded by `requireAdmin()`.
- [x] Add `updateUserRole(userId, role)` — validate `role` against an allowed list
      (`user`, `admin`) via Zod before writing.
- [x] Build `app/admin/users/page.tsx` (table: name, email, role, actions) and add
      it to `app/admin/main-nav.tsx`. (Nav link already existed; wired
      `components/admin/admin-search.tsx` to route to `/admin/users` too.)
- [x] Add a role-change control (dropdown or dialog) and a delete-user confirmation
      (reuse `components/shared/delete-dialog.tsx`, same as products/orders). New
      `components/admin/update-user-role-dialog.tsx` uses the existing
      Dialog + RadioGroup pattern from the payment-method form.
- [x] Guard against an admin deleting/demoting themselves into a lockout — both
      `deleteUser` and `updateUserRole` reject changes to the caller's own account,
      and the UI shows "(You)" instead of action buttons on that row.

## Acceptance criteria
- [x] `/admin/users` lists all users with pagination, matching the style of
  `/admin/orders`.
- [x] An admin can change another user's role and it takes effect on that user's next
  request (e.g. they can now reach `/admin`).
- [x] An admin can delete a user.

Verified 2026-07-14: built, type-checked, linted clean, and driven end-to-end in a
headless browser (sign-in, role change with toast confirmation, delete
confirmation dialog, self-lockout row) against the real dev database.
