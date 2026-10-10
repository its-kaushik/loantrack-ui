# LoanTrack UI

Mobile-first PWA for LoanTrack, a multi-tenant app for small money-lending businesses. Tenant ADMINs manage customers, monthly and daily loans, approvals, expenses, funds and reports; COLLECTORs record daily collections in the field; a SUPER_ADMIN manages tenants.

The API is a separate repo, expected as a sibling checkout at `../loantrack` (Express + Prisma + Postgres). Its `CLAUDE.md` is the reference for business rules and endpoint behaviour; this file covers the frontend.

## IMPORTANT: this is production financial software

**LoanTrack is live and people use these screens to lend, collect and record real money.** A wrong figure on screen, a payment submitted twice or a form that sends the wrong field is a financial error for a real person. Be very careful with every change, however small. This takes priority over speed and over tidiness.

- **Understand before you edit.** Read the component, its hook and the matching backend schema in `../loantrack/src/schemas` first. If the intended behaviour is unclear, ask — never guess at how money should behave.
- **Keep changes small and scoped.** No drive-by refactors or restyling in payment, collection, loan or approval flows.
- **The server is the source of truth for money.** Show what the API returns. Any amount calculated in the UI (previews, totals) must match the backend formula exactly and be labelled as a preview.
- **Never allow a double submission.** Keep submit buttons disabled while a mutation is pending, keep the `Idempotency-Key` on bulk collection, and keep mutations at zero automatic retries.
- **Don't change request payloads blind.** Check the backend schema for field names, required fields and types; the API silently drops fields it doesn't know.
- **Keep confirmations on irreversible actions**: close, default, write-off, cancel, settle, principal return, fixing or removing an entry, waiver, approve/reject.
- **Verify before calling it done.** Run `npm test`, `npm run lint` and `npm run build`, and exercise the changed screen. If something could not be run or checked, say so plainly.
- **Hard-to-undo steps need an explicit go-ahead**: committing, pushing, deploying. Installed PWAs cache the app's assets, so a bad release can linger on users' phones.
- **Work from `main`.** It is the default branch; `master` is an old line 31 commits behind it (see Gotchas). Check `git branch --show-current` before starting.
- **Pushing to `main` is a production deploy.** Vercel deploys `main` to `loantrack-ui.vercel.app` automatically, and any other pushed branch gets a public preview deployment. Work on a local branch. A screen that calls a new API endpoint must not reach `main` before the backend that serves it is live.

## Stack

- Next.js 16 App Router, React 19, TypeScript (strict, `@/*` -> `src/*`)
- Tailwind CSS 4 (config lives in `src/app/globals.css`), shadcn/ui "new-york" on Radix, lucide icons, sonner toasts
- TanStack Query 5 for server state, zustand for auth and UI state
- react-hook-form + zod (imported from `zod/v4`), axios, date-fns
- `@ducanh2912/next-pwa` (Workbox service worker), `idb`
- vitest + Testing Library + msw (jsdom)

## Commands

```bash
npm run dev             # next dev (service worker disabled in development)
npm run build           # next build --webpack (the PWA plugin needs webpack, not turbopack)
npm test                # vitest run
npx vitest run src/features/loans/__tests__/schemas.test.ts   # single file
npm run test:coverage
npm run lint            # eslint (eslint-config-next)
npm run format          # prettier on src/
```

Env (`.env.local`): `NEXT_PUBLIC_API_URL` is the backend **origin** with no trailing `/api/v1` — the client appends it. The API and `next dev` both default to port 3000, so run one of them on another port. The msw handlers assume `http://localhost:3000/api/v1`.

## Layout

```
src/
  app/                     routes only; pages are thin and render feature components
    (auth)/login
    (app)/                 authenticated shell: token bootstrap, role-based route guard
      (admin)/             dashboard, money (expenses, fund, reports), more (approvals, transactions, users, penalties)
      (browse)/            customers, loans, today — shared by ADMIN and COLLECTOR
      (collector)/         profile
      (platform)/          super admin: stats, tenants
      shared/              profile, change-password (all roles)
  features/<domain>/       components/, hooks/, schemas.ts, types.ts, __tests__/
  lib/api/<domain>.api.ts  one function per endpoint, all through lib/api/client.ts
  lib/query-keys.ts        query key factory
  components/ui/           shadcn primitives (add via the shadcn CLI, don't hand-write)
  components/shared/       app-level building blocks
  stores/                  auth-store (persisted), ui-store
  types/                   entities, enums, requests, api envelope types
  utils/                   currency, date, case-transform, idempotency
  test/                    vitest setup, msw server + handlers, renderWithProviders
docs/                      copies of the backend BRD/specs, frontend BRD/spec/plan, swagger.json snapshot
```

Feature domains: auth, collector, customers, dashboard, expenses, fund, loans, penalties, platform, reports, transactions, users.

## Conventions

- **Everything is a client component** (`'use client'`); there is no server-side data fetching. Dynamic route params arrive as a Promise and are unwrapped with `use(params)`.
- **Adding an endpoint**: types in `src/types` or the feature's `types.ts` -> function in `lib/api/<domain>.api.ts` -> key in `lib/query-keys.ts` -> a `useQuery` / `useInfiniteQuery` / `useMutation` hook in the feature's `hooks/` -> component. Pages don't call the API directly.
- **Casing**: write everything in camelCase. `lib/api/client.ts` converts request bodies and query params to snake_case; responses already arrive camelCase and are **not** converted. The one exception is login/refresh, whose snake_case payloads are mapped by hand in `auth.api.ts`.
- **Envelope**: the client unwraps `{ success, data }` to `data`, and paginated responses to `{ data, pagination }` (`PaginatedResponse<T>`). Errors are rejected as a normalised `ApiError` (`code`, `message`, `details[]`).
- **Lists** use `useInfiniteQuery` with `limit: 20` and render through `components/shared/infinite-list.tsx`. The API caps `limit` at 100.
- **Mutations** invalidate the relevant `queryKeys.*` entries in `onSuccess` and show a success toast there. Errors are toasted globally (the API's own message) by the mutation default in `lib/query-client.ts`, so hooks don't add their own error toast. A transaction mutation must invalidate the loan detail, its transactions, its payment status, `dashboard.today` and `collector.missedToday`.
- **Forms**: react-hook-form with `zodResolver` and a schema from the feature's `schemas.ts`; schemas have unit tests in `__tests__/`. Use `CurrencyInput`, `DatePicker`, `CustomerPicker`, `LoanPicker` from `components/shared`. Confirmations use `ConfirmationDialog`; anything needing input (reason, amount) uses a bottom `Sheet`.
- **Money**: entity amounts are `number`; dashboard, fund and report aggregates are 2-dp `string`s. Render both through `CurrencyDisplay` / `formatCurrency` (en-IN grouping, `Rs ` prefix).
- **Dates**: business dates are `YYYY-MM-DD` strings in the device's local timezone; display with `formatDate` / `formatTimestamp` from `utils/date.ts`.
- **Offline**: actions that need the network use `OfflineAwareButton`; `OfflineBanner` shows connectivity. There is no offline data and no queued write path — API responses are not cached.
- Prettier: single quotes, semicolons, trailing commas, width 100.

## Auth and roles

- `stores/auth-store.ts` keeps the access token **in memory only**; the refresh token, expiry and user are persisted to localStorage under `loantrack-auth`. Gate on `isHydrated` before reading persisted state.
- `(app)/layout.tsx` bootstraps on load: exchanges the refresh token for an access token, then refreshes again at 80% of token lifetime. A 403 on refresh renders the "Tenant Suspended" screen; any other failure clears auth and redirects to `/login`.
- `lib/api/client.ts` also handles a 401 by refreshing once and replaying queued requests. Refresh tokens rotate on every use, so never call the refresh endpoint from anywhere else.
- Role homes: SUPER_ADMIN `/platform`, ADMIN `/dashboard`, COLLECTOR `/today`. Allowed path prefixes per role are listed in `isRouteAllowedForRole` in `(app)/layout.tsx`; each route-group layout guards again and supplies navigation (bottom tab bar for admin/collector, sidebar for platform).
- All gating is client-side convenience — the API enforces permissions. In `(browse)` screens a collector gets a read-only view via a `readOnly` prop on the detail components (`isCollector` from the auth store).

## Domain notes for UI work

- `GET /loans/:id` returns either a monthly or a daily shape; switch on `loanType` (`MonthlyLoanDetail` / `DailyLoanDetail` types and components). Payment status is likewise cycles (monthly) or days (daily).
- `POST /transactions` returns an **array**: one interest payment can be split across several unpaid months plus an automatic principal return.
- The collector's Today screen is driven by `GET /loans/missed-today` (`useCollectionsToday`): active daily loans with nothing recorded today, plus the collector's own count and total. Recording a payment redirects to the loan page.
- A collector's transactions come back `PENDING` and don't change loan balances until an admin approves them under More -> Pending Approvals. Admin transactions are approved immediately.
- **The payment form** (`record-payment-form.tsx`) offers only the types the server accepts for the loan (`paymentTypesFor`), as buttons with the usual one selected: Interest / Principal for monthly, Collection / Penalty for daily, plus Guarantor on a defaulted loan. A principal return shows what happens to the principal and is sent only after a confirmation that also points out unpaid interest. Entering interest as principal is the costly mistake — don't make it easier.
- **Fixing a wrong entry** (admin). A recorded payment is never edited: it is undone and replaced. `…/more/transactions/new?fix=<transactionId>` opens the payment form in fix mode, filled from `GET /transactions/:id/entry`; saving calls `POST /transactions/:id/fix`, which undoes the entry and records the replacement (any of loan, type, amount, date may differ) as one operation. `RemoveEntrySheet` calls `POST /transactions/:id/remove` for an entry that should not exist. Both are reached from `EntryActionsMenu` on the loan's transaction list and on Transaction History.
- Whether an entry may be changed is the **server's** decision: daily loans, any entry on an open loan; monthly loans, the latest entry only. The loan transaction list carries `canFix` per row; elsewhere, ask `getEntry` and show its `reason`. Don't reimplement the rule in the UI.
- One payment can be several rows (an interest payment split over months, plus a principal return for the excess); fix and remove act on all of them, so show the entry's amount from `getEntry`, not the row's. In lists, `isCorrected` rows are struck through and `isCorrection` rows (negative amounts) are labelled Reversal.
- Bulk daily collection (`POST /transactions/bulk`) needs an `Idempotency-Key` header (`utils/idempotency.ts`) and returns per-item success/failure; show the result with `bulk-result-modal`.
- Penalties exist only on daily loans; interest waivers only on monthly loans.
- Cancelling a loan requires a non-empty `cancellationReason`.
- A daily loan repaid for less than its scheduled total (usually an early repayment charged less interest) is closed with **Settle & Close**, not Close: `PATCH /loans/:id/settle` with `settlementAmount` equal to the loan's `totalCollected`. The button shows only when `canSettleDailyLoan` holds (active, principal recovered, scheduled total not reached). After settling, `totalRepaymentAmount` is the settled amount, `isSettled` is true and `originalTotalRepaymentAmount` holds the old schedule. Never work around a loan that won't close by recording a collection that wasn't received.

## PWA

Configured in `next.config.ts`: static assets (js, css, fonts) are stale-while-revalidate. API responses are deliberately **not** cached by the service worker — that was removed to stop users seeing stale financial data, so don't add it back. Generated `public/sw.js` and `public/workbox-*.js` are gitignored. `InstallBanner` + `use-install-prompt` drive the install prompt.

## Testing

- `src/test/setup.ts` starts the msw server with `onUnhandledRequest: 'bypass'`; add handlers in `src/test/mocks/handlers.ts` or per test with `server.use`.
- Render components with `renderWithProviders` from `src/test/test-utils.tsx` (fresh QueryClient, retries off).
- Existing coverage is zod schemas, utils, the auth store, query keys and a few components; there are no page-level or end-to-end tests.

## Gotchas

- **Branches**: `main` is the default. `master` stops on 2026-02-01 and is 31 commits behind; it still has the old collector Today screen (three list calls instead of `missed-today`), `effectiveDate` fields on the payment and waive-interest forms, service-worker API caching and the old P&L type. Everything in this file describes `main`.
- `README.md` is the unmodified create-next-app template.
- `src/lib/offline-db.ts` (IndexedDB cache) is not imported anywhere.
- `todayString()` is copy-pasted into nine feature files besides `utils/date.ts`, and `getRoleHomePath()` into four; prefer importing the shared one in new code.
- The server computes "today" in UTC while the UI uses local time, so dashboards and "missed today" can disagree with the device date between 00:00 and 05:30 IST.
- The backend spec copies in `docs/backend` and `docs/swagger.json` are snapshots and lag the API.

### Behind the API (checked 2026-10-11 on `main`)

- Advance interest was removed server-side (`advanceInterestAmount` is always 0), but `create-loan-form` still previews it and `monthly-loan-detail` still shows the row.
