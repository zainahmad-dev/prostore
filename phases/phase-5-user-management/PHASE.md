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
- [ ] Add `getAllUsers({ limit, page, query })` (mirror `getAllOrders`'s pagination/
      search pattern) and `deleteUser(id)` to `lib/actions/user.actions.ts`, both
      guarded by `requireAdmin()`.
- [ ] Add `updateUserRole(userId, role)` — validate `role` against an allowed list
      (`user`, `admin`) via Zod before writing.
- [ ] Build `app/admin/users/page.tsx` (table: name, email, role, actions) and add
      it to `app/admin/main-nav.tsx`.
- [ ] Add a role-change control (dropdown or dialog) and a delete-user confirmation
      (reuse `components/shared/delete-dialog.tsx`, same as products/orders).
- [ ] Guard against an admin deleting/demoting themselves into a lockout (optional
      but worth deciding on).

## Acceptance criteria
- `/admin/users` lists all users with pagination, matching the style of
  `/admin/orders`.
- An admin can change another user's role and it takes effect on that user's next
  request (e.g. they can now reach `/admin`).
- An admin can delete a user.
