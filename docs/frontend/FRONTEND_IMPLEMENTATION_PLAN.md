# LoanTrack Frontend — Implementation Plan

> Derived from `FRONTEND_BRD.md` and `FRONTEND_TECH_SPEC.md`. Each phase lists exact files, dependencies, API endpoints, and acceptance criteria.

---

## Phase 0: Project Scaffolding & Dev Environment

**Goal:** Bootable Next.js app with all tooling configured. No features — just the skeleton.

### 0.1 Initialize Next.js project

- `npx create-next-app@latest loantrack-web --typescript --tailwind --eslint --app --src-dir`
- Verify: `npm run dev` renders the default page

### 0.2 Install core dependencies

```
# UI & Styling
npx shadcn@latest init
npm i sonner

# State & Data
npm i @tanstack/react-query@5 zustand axios zod react-hook-form @hookform/resolvers

# Utilities
npm i date-fns idb lucide-react

# Dev / Testing
npm i -D vitest @testing-library/react @testing-library/jest-dom jsdom msw@2 @vitejs/plugin-react prettier eslint-config-prettier eslint-plugin-react-hooks
```

### 0.3 Configure tooling

| File | Purpose |
|------|---------|
| `tsconfig.json` | Add `"@/*": ["./src/*"]` path alias |
| `.prettierrc` | `{ "semi": true, "trailingComma": "all", "singleQuote": true, "printWidth": 100, "tabWidth": 2 }` |
| `.env.local` | `NEXT_PUBLIC_API_URL=http://localhost:3000` |
| `.env.example` | Same keys, blank values |
| `vitest.config.ts` | jsdom environment, path aliases, setup file |
| `.gitignore` | Verify `.env.local`, `node_modules`, `.next` are excluded |

### 0.4 Install shadcn/ui primitives

```
npx shadcn@latest add button input select dialog sheet tabs badge skeleton card dropdown-menu tooltip switch label textarea popover calendar command scroll-area progress alert-dialog
```

These land in `src/components/ui/`.

### 0.5 Create directory skeleton

Create empty directories matching the tech spec project structure:

```
src/
├── app/
│   ├── (auth)/login/
│   ├── (app)/
│   │   ├── (admin)/dashboard/
│   │   ├── (admin)/loans/
│   │   ├── (admin)/customers/
│   │   ├── (admin)/money/
│   │   ├── (admin)/more/
│   │   ├── (collector)/today/
│   │   ├── (collector)/loans/
│   │   ├── (collector)/customers/
│   │   ├── (collector)/profile/
│   │   ├── (platform)/platform/
│   │   └── shared/
├── components/
│   ├── ui/          (populated by shadcn)
│   └── shared/
├── features/
│   ├── auth/        (components/, hooks/)
│   ├── dashboard/   (components/, hooks/)
│   ├── loans/       (components/, hooks/)
│   ├── transactions/(components/, hooks/)
│   ├── customers/   (components/, hooks/)
│   ├── penalties/   (components/, hooks/)
│   ├── expenses/    (components/, hooks/)
│   ├── fund/        (components/, hooks/)
│   ├── reports/     (components/, hooks/)
│   ├── users/       (components/, hooks/)
│   ├── platform/    (components/, hooks/)
│   └── collector/   (components/, hooks/)
├── lib/api/
├── stores/
├── types/
├── utils/
├── hooks/
└── styles/
```

### 0.6 Create global styles

**File:** `src/styles/globals.css`

- Tailwind directives (`@tailwind base; @tailwind components; @tailwind utilities;`)
- CSS custom properties from tech spec Section 8.4 (theme variables: `--primary`, `--destructive`, `--success`, `--warning`, `--info`, etc.)
- Light mode only — no dark mode toggle

### 0.7 Create foundational types

**Files:**

| File | Contents |
|------|----------|
| `src/types/enums.ts` | `LoanType`, `LoanStatus`, `TransactionType`, `ApprovalStatus`, `PenaltyStatus`, `ExpenseCategory`, `FundEntryType`, `TenantStatus`, `UserRole` |
| `src/types/api.ts` | `PaginatedResponse<T>`, `ApiError`, `ApiValidationDetail` |
| `src/types/entities.ts` | `Customer`, `Loan`, `MonthlyLoanDetail`, `DailyLoanDetail`, `Transaction`, `TransactionDetail`, `BulkCollectionResult`, `Penalty`, `Expense`, `FundEntry`, `FundSummary`, `User`, `Tenant` |
| `src/types/requests.ts` | `CreateCustomerRequest`, `CreateLoanRequest`, `CreateTransactionRequest`, `BulkCollectionRequest`, `CreateExpenseRequest`, `CreateFundEntryRequest`, `CreateUserRequest`, `CreateTenantRequest` |

### 0.8 Create utility modules

**Files:**

| File | Contents |
|------|----------|
| `src/utils/currency.ts` | `formatCurrency(amount)` — Indian Rupee format: `Rs 1,00,000.00` using `Intl.NumberFormat('en-IN')` |
| `src/utils/date.ts` | `formatDate(str)`, `formatTimestamp(str)`, `todayString()` — all using `date-fns` |
| `src/utils/case-transform.ts` | `camelToSnake(obj)`, `snakeToCamel(str)` — for request body transformation |
| `src/utils/idempotency.ts` | `generateIdempotencyKey()` — wraps `crypto.randomUUID()` |

### 0.9 Write unit tests for utilities

**Files:** `src/utils/__tests__/currency.test.ts`, `date.test.ts`, `case-transform.test.ts`

**Acceptance criteria:**
- [x] `npm run dev` boots without errors
- [x] `npm run build` succeeds
- [x] `npm run test` passes utility tests
- [x] shadcn/ui components importable from `@/components/ui/*`
- [x] Path alias `@/*` resolves correctly
- [x] All type files compile with no errors

---

## Phase 1: Authentication & Core Layout

**Goal:** Login, logout, token management, role-based routing, and shell layouts for all three roles.

**Depends on:** Phase 0

### 1.1 API client with interceptors

**File:** `src/lib/api/client.ts`

- Axios instance with `baseURL = NEXT_PUBLIC_API_URL/api/v1`
- **Request interceptor:** attach `Authorization: Bearer <token>` from auth store, transform request body keys camelCase → snake_case
- **Response interceptor:** unwrap `{ success: true, data }` envelope, normalize errors
- **401 handler:** concurrent-safe refresh with `isRefreshing` mutex + `failedQueue` (tech spec Section 4.3 — each queued request updates its own Authorization header before retry)
- 30s timeout

### 1.2 Auth API module

**File:** `src/lib/api/auth.api.ts`

| Function | Endpoint | Notes |
|----------|----------|-------|
| `login(phone, password)` | `POST /auth/login` | Manually map snake_case response (`access_token`, `refresh_token`, `expires_in`, `user.tenant_id`) |
| `refreshToken(token)` | `POST /auth/refresh` | Returns new token pair |
| `logout()` | `POST /auth/logout` | Server revokes refresh tokens |
| `changePassword(current, new)` | `PATCH /auth/change-password` | |
| `getMe()` | `GET /auth/me` | |

### 1.3 Auth store (Zustand)

**File:** `src/stores/auth-store.ts`

- State: `accessToken` (in-memory only), `refreshToken` (persisted), `expiresAt` (persisted), `user: AuthUser | null` (persisted)
- Actions: `setAuth()`, `setTokens()`, `clearAuth()`
- Zustand `persist` middleware with `partialize` to exclude `accessToken` from localStorage
- Proactive refresh timer: schedule at 80% of `expiresIn`

### 1.4 UI store (Zustand)

**File:** `src/stores/ui-store.ts`

- State: `sidebarOpen`, `activeTab`
- Minimal for now — expanded in later phases

### 1.5 Query client & providers

**Files:**

| File | Contents |
|------|----------|
| `src/lib/query-client.ts` | QueryClient with defaults: `staleTime: 2min`, `gcTime: 10min`, `retry: 2`, `refetchOnWindowFocus: true`, mutations `retry: 0` |
| `src/lib/query-keys.ts` | Full query key factory (all keys from tech spec Section 5.1) |
| `src/lib/providers.tsx` | `QueryClientProvider` + any app-wide providers. Wrap children. `"use client"` |

### 1.6 Root layout

**File:** `src/app/layout.tsx`

- HTML shell, font loading, `<Providers>` wrapper
- Import `globals.css`
- Sonner `<Toaster>` for toast notifications

### 1.7 Auth bootstrap & route protection

**File:** `src/app/(app)/layout.tsx`

- On mount: hydrate Zustand from localStorage
- If `refreshToken` exists → call refresh API → set tokens → schedule next refresh
- If no `refreshToken` → redirect to `/login`
- Role-based redirect guard:
  - ADMIN trying to access collector routes → redirect to `/dashboard`
  - COLLECTOR trying to access admin routes → redirect to `/today`
  - SUPER_ADMIN trying to access tenant routes → redirect to `/platform`
- Suspended tenant → render "Tenant Suspended" screen with logout button

### 1.8 Login page

**Files:**

| File | Contents |
|------|----------|
| `src/app/(auth)/layout.tsx` | Centered card layout, no nav shell |
| `src/app/(auth)/login/page.tsx` | Login page shell |
| `src/features/auth/schemas.ts` | `loginSchema` (Zod): phone (required), password (required, min 6) |
| `src/features/auth/types.ts` | `LoginFormValues`, `AuthUser` |
| `src/features/auth/components/login-form.tsx` | Form with React Hook Form + Zod. Phone input (`inputMode="tel"`), password input, submit button with loading state. On success: `setAuth()` → redirect by role |
| `src/features/auth/hooks/use-login.ts` | `useMutation` wrapping `login()` API call |

### 1.9 Admin shell layout

**Files:**

| File | Contents |
|------|----------|
| `src/app/(app)/(admin)/layout.tsx` | Admin layout: role guard (must be ADMIN), bottom tab bar (5 tabs), FAB slot |
| `src/components/shared/bottom-tab-bar.tsx` | Fixed bottom nav. Props: `tabs[]` (icon, label, path, badge?), `activeTab`. Uses `lucide-react` icons |
| `src/components/shared/fab.tsx` | Floating action button. Props: `icon`, `label`, `onClick`. Positioned above tab bar |
| `src/components/shared/page-header.tsx` | Title + optional back button + optional action button |

**Admin tabs** (from BRD Section 5.1):

| Tab | Icon | Path | Badge |
|-----|------|------|-------|
| Home | `LayoutDashboard` | `/dashboard` | Pending approvals count |
| Loans | `Briefcase` | `/loans` | — |
| Customers | `Users` | `/customers` | — |
| Money | `Wallet` | `/money` | — |
| More | `Menu` | `/more` | — |

### 1.10 Collector shell layout

**File:** `src/app/(app)/(collector)/layout.tsx`

- Role guard (must be COLLECTOR)
- Bottom tab bar (4 tabs): Today, Loans, Customers, Profile
- FAB: "Bulk Submit" on Today tab

### 1.11 Super Admin shell layout

**Files:**

| File | Contents |
|------|----------|
| `src/app/(app)/(platform)/layout.tsx` | Role guard (must be SUPER_ADMIN), sidebar nav |
| `src/components/shared/sidebar-nav.tsx` | Desktop sidebar. Items: Dashboard, Tenants, Profile, Logout |

### 1.12 Profile & Change Password (shared)

**Files:**

| File | Contents |
|------|----------|
| `src/app/(app)/shared/profile/page.tsx` | Display user info (name, phone, role, tenant). Read-only |
| `src/app/(app)/shared/change-password/page.tsx` | Change password form |
| `src/features/auth/schemas.ts` | Add `changePasswordSchema` |
| `src/features/auth/components/change-password-form.tsx` | Current password + new password + confirm. Zod validation |
| `src/features/auth/hooks/use-logout.ts` | Calls logout API, clears auth store, redirects to `/login` |

### 1.13 Shared UI components (first batch)

**Files:**

| File | Purpose |
|------|---------|
| `src/components/shared/offline-banner.tsx` | Orange bar: "You are offline." Uses `useOnlineStatus` |
| `src/components/shared/confirmation-dialog.tsx` | Wraps `alert-dialog` from shadcn. Props: `title`, `description`, `onConfirm`, `destructive?` |
| `src/components/shared/status-badge.tsx` | Color-coded badge. Props: `status`, `variant` (loan/transaction/penalty). Color map from tech spec Section 8.3 |
| `src/components/shared/empty-state.tsx` | Illustration area + title + description + optional CTA button |
| `src/hooks/use-online-status.ts` | `useSyncExternalStore` with `online`/`offline` events. SSR snapshot: `true` |
| `src/hooks/use-debounce.ts` | Debounce hook for search inputs |

### 1.14 Loading & Error boundaries

**Files:**

| File | Contents |
|------|----------|
| `src/app/(app)/(admin)/loading.tsx` | Skeleton screen for admin shell |
| `src/app/(app)/(collector)/loading.tsx` | Skeleton screen for collector shell |
| `src/app/(app)/(platform)/loading.tsx` | Skeleton screen for platform shell |
| `src/app/error.tsx` | Global error boundary with retry button |
| `src/app/not-found.tsx` | 404 page |

**Acceptance criteria:**
- [x] Login with valid phone + password → lands on role-appropriate home screen
- [x] Login with invalid credentials → inline error message
- [x] Closing tab and reopening → refresh token hydrates, user stays logged in
- [x] Token expiry → silent refresh at 80% TTL
- [x] Refresh failure → redirect to login
- [x] Admin cannot access `/today` (collector route) — redirected to `/dashboard`
- [x] Collector cannot access `/dashboard` (admin route) — redirected to `/today`
- [x] Super Admin cannot access `/loans` — redirected to `/platform`
- [x] Unauthenticated user visiting any app route → redirected to `/login`
- [x] Bottom tab bar highlights active tab
- [x] Profile page shows current user info
- [x] Change password works with validation
- [x] Logout clears tokens and redirects to login
- [x] Offline banner appears when network is disconnected

---

## Phase 2: Admin Dashboard

**Goal:** All 4 dashboard views (Today, Overdue, Defaulters, Fund Summary) with real data.

**Depends on:** Phase 1

### 2.1 Dashboard API module

**File:** `src/lib/api/dashboard.api.ts`

| Function | Endpoint |
|----------|----------|
| `getTodaySummary()` | `GET /dashboard/today` |
| `getOverdueSummary()` | `GET /dashboard/overdue` |
| `getDefaultersSummary()` | `GET /dashboard/defaulters` |
| `getFundSummary()` | `GET /dashboard/fund-summary` |

### 2.2 Dashboard types & hooks

**Files:**

| File | Contents |
|------|----------|
| `src/features/dashboard/types.ts` | `TodaySummary`, `OverdueSummary`, `DefaultersSummary` (matching API response shapes from backend spec Section 5.10) |
| `src/features/dashboard/hooks/use-today-summary.ts` | `useQuery` with `queryKeys.dashboard.today()` |
| `src/features/dashboard/hooks/use-overdue.ts` | `useQuery` with `queryKeys.dashboard.overdue()` |
| `src/features/dashboard/hooks/use-defaulters.ts` | `useQuery` with `queryKeys.dashboard.defaulters()` |
| `src/features/dashboard/hooks/use-fund-summary.ts` | `useQuery` with `queryKeys.dashboard.fundSummary()` |

### 2.3 Dashboard Today page (A1)

**Files:**

| File | Contents |
|------|----------|
| `src/app/(app)/(admin)/dashboard/page.tsx` | Dashboard Today page. Tab navigation to sub-pages |
| `src/features/dashboard/components/today-summary.tsx` | Main dashboard view |
| `src/features/dashboard/components/collection-progress-card.tsx` | Progress bar: received / expected (count + amount) |
| `src/features/dashboard/components/pending-approvals-card.tsx` | Tappable badge with count → navigates to `/more/approvals` |
| `src/features/dashboard/components/missed-collections-list.tsx` | Scrollable list of daily loans with no collection today. Borrower name, daily amount, phone (tap-to-call via `tel:` link). Max 5 visible + "See all" |
| `src/features/dashboard/components/monthly-interest-due-list.tsx` | Monthly loans with interest due today |
| `src/features/dashboard/components/total-collected-card.tsx` | Large currency display of today's total |

**Layout:** Card-based, single column on mobile. Pull-to-refresh.

### 2.4 Dashboard Overdue page (A2)

**File:** `src/app/(app)/(admin)/dashboard/overdue/page.tsx`

- Two sections: overdue daily loans, overdue monthly loans
- Each item: borrower name, days/months overdue, amount remaining/due, guarantor info
- Tap item → navigate to loan detail (implemented in Phase 3)

### 2.5 Dashboard Defaulters page (A3)

**File:** `src/app/(app)/(admin)/dashboard/defaulters/page.tsx`

- List of defaulted and written-off loans
- Borrower name, guarantor details, loan amount, status badge
- Tap → loan detail

### 2.6 Dashboard Fund Summary page (A4)

**File:** `src/app/(app)/(admin)/dashboard/fund-summary/page.tsx`

- 8 KPI cards: Total Capital Invested, Money Deployed, Total Interest Earned, Money Lost to Defaults, Total Expenses, Revenue Forgone, Net Profit, Cash in Hand
- Each value: `CurrencyDisplay` component
- Note: `FundSummary` returns strings — parse with `parseFloat()` before display

### 2.7 Shared components (second batch)

**Files:**

| File | Purpose |
|------|---------|
| `src/components/shared/currency-display.tsx` | Renders formatted currency. Props: `amount: number` |
| `src/components/shared/pull-to-refresh.tsx` | Touch gesture handler wrapping children. Props: `onRefresh`, `children` |

### 2.8 Dashboard navigation

- Dashboard page includes tab navigation (Today / Overdue / Defaulters / Fund Summary) — implemented as either shadcn `Tabs` or sub-route links
- Badge on Home tab shows pending approvals count (fetched from today summary)

**Acceptance criteria:**
- [x] Dashboard Today shows collection progress, pending approvals count, missed collections, monthly interest due, total collected
- [x] Tap on missed collection item → navigates (will land on placeholder until Phase 3)
- [x] Tap on pending approvals badge → navigates to `/more/approvals` (placeholder until Phase 4)
- [x] Dashboard Overdue shows overdue daily and monthly loans
- [x] Dashboard Defaulters shows defaulted/written-off loans
- [x] Fund Summary shows all 8 KPIs with correct currency formatting
- [x] Pull-to-refresh reloads dashboard data
- [x] Skeleton loading states while data fetches
- [x] Empty states when no data (e.g., "All caught up! No pending approvals.")
- [x] Phone numbers on missed collections are tap-to-call on mobile

---

## Phase 3: Loan Management (Core)

**Goal:** Loan list, both detail views (monthly & daily), and create loan form.

**Depends on:** Phase 2

### 3.1 Loans API module

**File:** `src/lib/api/loans.api.ts`

| Function | Endpoint | Notes |
|----------|----------|-------|
| `listLoans(params)` | `GET /loans` | Filters: `type`, `status`, `borrower_id`, `search`, `page`, `limit` |
| `getLoan(id)` | `GET /loans/:id` | Returns `MonthlyLoanDetail` or `DailyLoanDetail` |
| `createLoan(body)` | `POST /loans` | Discriminated by `loanType` |
| `getLoanTransactions(id, params)` | `GET /loans/:id/transactions` | |
| `getLoanPaymentStatus(id)` | `GET /loans/:id/payment-status` | Day-by-day or month-by-month |
| `closeLoan(id)` | `PATCH /loans/:id/close` | |
| `defaultLoan(id)` | `PATCH /loans/:id/default` | |
| `writeOffLoan(id)` | `PATCH /loans/:id/write-off` | |
| `cancelLoan(id)` | `PATCH /loans/:id/cancel` | |

### 3.2 Loan types, schemas, hooks

**Files:**

| File | Contents |
|------|----------|
| `src/features/loans/types.ts` | `ListLoansParams`, `PaymentStatusEntry` (monthly cycle or daily day) |
| `src/features/loans/schemas.ts` | `createMonthlyLoanSchema`, `createDailyLoanSchema` — Zod. Date fields as `YYYY-MM-DD` strings |
| `src/features/loans/hooks/use-loans.ts` | `useInfiniteQuery` for loan list with filters |
| `src/features/loans/hooks/use-loan-detail.ts` | `useQuery` for single loan |
| `src/features/loans/hooks/use-loan-transactions.ts` | `useInfiniteQuery` for loan's transactions |
| `src/features/loans/hooks/use-loan-payment-status.ts` | `useQuery` for payment status grid |
| `src/features/loans/hooks/use-create-loan.ts` | `useMutation` → invalidates loan list |

### 3.3 Shared data components

**Files:**

| File | Purpose |
|------|---------|
| `src/components/shared/infinite-list.tsx` | Scroll-triggered infinite loading. Props: `query` (useInfiniteQuery result), `renderItem`, `emptyState` |
| `src/components/shared/currency-input.tsx` | Numeric input with `inputMode="numeric"`, live format preview. Props: `value`, `onValueChange` |
| `src/components/shared/date-picker.tsx` | Calendar popover returning `YYYY-MM-DD` string. "Today" shortcut. Strips time/timezone. Uses shadcn `calendar` + `popover` |
| `src/components/shared/customer-picker.tsx` | Type-ahead search by name or phone. Combobox using shadcn `command`. Props: `value`, `onChange` |

### 3.4 Loan List page (A5)

**Files:**

| File | Contents |
|------|----------|
| `src/app/(app)/(admin)/loans/page.tsx` | Loan list page with filters |
| `src/features/loans/components/loan-list-filters.tsx` | Type toggle (All/Monthly/Daily), status chips, search input (debounced) |
| `src/features/loans/components/loan-card.tsx` | Card per loan: loan number, borrower name, principal, status badge, type indicator. Tap → detail |

- Infinite scroll via `InfiniteList`
- Total count displayed at top
- FAB: "New Loan" → `/loans/new`
- Empty state: "No loans yet. Create your first loan to get started."

### 3.5 Loan Detail — Monthly (A6)

**Files:**

| File | Contents |
|------|----------|
| `src/app/(app)/(admin)/loans/[id]/page.tsx` | Loan detail page — branches on `loanType` to render monthly or daily view |
| `src/features/loans/components/monthly-loan-detail.tsx` | Full monthly loan view |
| `src/features/loans/components/payment-status-table.tsx` | Billing cycle table: month, interest due, paid, waived, settled checkmark. Current cycle highlighted |
| `src/features/loans/components/loan-transaction-list.tsx` | Chronological transaction list. Corrected transactions shown with strikethrough + "Corrected" badge. Corrective transactions show negative amount in red |

**Sections:**
1. Header: loan number, status badge, borrower name (tappable → customer detail)
2. Key Metrics: principal, remaining principal, billing principal (with info tooltip), interest rate, advance interest, monthly due day
3. Quick Actions: Record Payment, Close Loan, Mark Default, Cancel (contextual visibility)
4. Payment Status table
5. Transaction History
6. Loan Info: disbursement date, guarantor, collateral, notes, created by, migrated flag

### 3.6 Loan Detail — Daily (A7)

**File:** `src/features/loans/components/daily-loan-detail.tsx`

**Sections:**
1. Header: loan number, status badge, borrower name
2. Progress Bar: `total_collected / total_repayment_amount` (shadcn `progress`)
3. Key Metrics: principal, total repayment, daily amount, term days, days elapsed, days paid, days remaining, total collected, total remaining, grace days
4. Overdue Alert: red banner if overdue — days overdue, penalty applicable
5. Quick Actions: Record Collection, Impose Penalty (if overdue), Close Loan, Mark Default
6. Collection Calendar: grid of term days — green (paid), red (missed), grey (future)
7. Transaction History
8. Loan Info

**File:** `src/features/loans/components/collection-calendar.tsx` — Visual grid view of daily payment status

### 3.7 Create Loan form (A8)

**Files:**

| File | Contents |
|------|----------|
| `src/app/(app)/(admin)/loans/new/page.tsx` | Create loan page |
| `src/features/loans/components/create-loan-form.tsx` | Unified form that switches fields based on loan type toggle |

**Form fields:**
1. Loan Type toggle: Monthly / Daily
2. Borrower: `CustomerPicker` with "Create New" shortcut (→ `/customers/new` inline or modal)
3. Principal: `CurrencyInput`
4. Interest Rate: numeric input (% per month)
5. **Monthly-specific:** Expected months (optional)
6. **Daily-specific:** Term days (preset picker: 120/60/custom), Grace days
7. Disbursement Date: `DatePicker` (default today)
8. Calculated Preview (live, display-only):
   - Monthly: advance interest = `principal * rate / 100`, monthly interest, due day
   - Daily: total repayment = `principal * (1 + rate/100 * termDays/30)`, daily payment = total / termDays
9. Optional section (collapsible): guarantor picker, collateral description, collateral value, notes
10. Confirm button — disabled until required fields valid

**Idempotency:** generate key on form mount via `useRef` + `generateIdempotencyKey()`

### 3.8 Loan status action hooks

**File:** `src/features/loans/hooks/use-loan-actions.ts`

- `useCloseLoan()` — `useMutation` → closeLoan API → invalidate loan detail + loan list
- `useDefaultLoan()` — confirmation dialog → defaultLoan API
- `useWriteOffLoan()` — confirmation dialog → writeOffLoan API
- `useCancelLoan()` — confirmation dialog + reason input → cancelLoan API

All destructive actions require `ConfirmationDialog`.

**Acceptance criteria:**
- [x] Loan list loads with infinite scroll, shows loan number, borrower, principal, status
- [x] Filters (type, status, search) work correctly and update URL params
- [x] Monthly loan detail shows all sections with correct data
- [x] Billing principal tooltip explains the concept
- [x] Payment status table shows cycle-by-cycle breakdown
- [x] Daily loan detail shows progress bar, collection calendar, all metrics
- [x] Collection calendar colors: green=paid, red=missed, grey=future
- [x] Create Loan form switches fields based on type toggle
- [x] Live calculation preview updates as user types
- [x] Daily loan: adjusting principal recalculates daily amount live
- [x] Form submission creates loan, navigates to detail
- [x] Customer picker searches by name/phone
- [x] Close/Default/Write-off/Cancel actions show confirmation dialogs
- [x] Corrected transactions display with strikethrough in transaction list

---

## Phase 4: Payments & Transactions

**Goal:** Record payments, pending approvals, transaction history, correction/reversal flow.

**Depends on:** Phase 3

### 4.1 Transactions API module

**File:** `src/lib/api/transactions.api.ts`

| Function | Endpoint |
|----------|----------|
| `createTransaction(body)` | `POST /transactions` |
| `bulkCollect(body, idempotencyKey)` | `POST /transactions/bulk` (header: `Idempotency-Key`) |
| `listTransactions(params)` | `GET /transactions` |
| `listPendingTransactions(params)` | `GET /transactions/pending` |
| `approveTransaction(id)` | `PATCH /transactions/:id/approve` |
| `rejectTransaction(id, reason)` | `PATCH /transactions/:id/reject` |

### 4.2 Transaction types, schemas, hooks

**Files:**

| File | Contents |
|------|----------|
| `src/features/transactions/types.ts` | `ListTransactionsParams`, `CreateTransactionFormValues` |
| `src/features/transactions/schemas.ts` | `createTransactionSchema` (Zod): loan, type, amount, date, effective date (conditional), penalty_id (conditional), notes |
| `src/features/transactions/hooks/use-create-transaction.ts` | `useMutation` → invalidate loan detail + transactions |
| `src/features/transactions/hooks/use-transactions.ts` | `useInfiniteQuery` for transaction list |
| `src/features/transactions/hooks/use-pending-transactions.ts` | `useQuery` for pending approvals |
| `src/features/transactions/hooks/use-approve-transaction.ts` | `useMutation` with **optimistic update** (remove from pending list immediately, revert on error) |
| `src/features/transactions/hooks/use-reject-transaction.ts` | `useMutation` with optimistic update |

### 4.3 Record Payment page (A10)

**Files:**

| File | Contents |
|------|----------|
| `src/features/transactions/components/record-payment-form.tsx` | Full payment form |
| `src/components/shared/loan-picker.tsx` | Type-ahead search by loan number or borrower name. Combobox. Props: `value`, `onChange` |

**Form behavior:**
- Loan picker (pre-filled if coming from loan detail)
- Transaction type dropdown (filtered by loan type — monthly: INTEREST_PAYMENT, PRINCIPAL_RETURN, PENALTY, GUARANTOR_PAYMENT; daily: DAILY_COLLECTION, PENALTY, GUARANTOR_PAYMENT)
- Amount: `CurrencyInput` (pre-filled with interest due / daily amount as reference)
- Transaction date: `DatePicker` (default today)
- Effective date: `DatePicker` (shown only for INTEREST_PAYMENT — identifies billing cycle)
- Penalty picker: shown only for PENALTY type — list of unpaid penalties
- Notes: optional textarea
- Shows reference info: interest due / daily amount / penalty payable
- Submit with idempotency key

### 4.4 Pending Approvals page (A11)

**Files:**

| File | Contents |
|------|----------|
| `src/app/(app)/(admin)/more/approvals/page.tsx` | Pending approvals list |
| `src/features/transactions/components/pending-transaction-card.tsx` | Card per pending transaction: loan number, borrower, amount, collector, date. Swipe or button actions: Approve / Reject |
| `src/features/transactions/components/rejection-reason-sheet.tsx` | Bottom sheet with reason text input + reject button |

- Approve: optimistic update (remove from list immediately)
- Reject: bottom sheet for reason → API call
- Empty state: "All caught up! No pending approvals."

### 4.5 Transaction History page (A12)

**Files:**

| File | Contents |
|------|----------|
| `src/app/(app)/(admin)/more/transactions/page.tsx` | Transaction history with filters |
| `src/features/transactions/components/transaction-list-filters.tsx` | Status filter, type filter, collector dropdown, date range pickers |
| `src/features/transactions/components/transaction-row.tsx` | Row per transaction. Approved rows show "Reverse" action (disabled if already has correction) |
| `src/features/transactions/components/reversal-sheet.tsx` | Bottom sheet for correction: shows original details, pre-filled negative amount, editable date, required reason notes, confirmation warning text |

**Reversal flow (BRD Section 4.10):**
1. Tap "Reverse" on an approved transaction
2. Bottom sheet shows: original details, pre-filled corrective values
3. Notes (reason) required
4. "Confirm Reversal" → `POST /transactions` with `corrected_transaction_id` + negative amount
5. On success: toast, original row shows "Corrected" badge, new corrective row appears

### 4.6 Integration with Loan Detail

- "Record Payment" button on A6/A7 navigates to record payment page with pre-filled loan
- Transaction history section on loan detail uses the same `transaction-row.tsx` component

**Acceptance criteria:**
- [x] Record Payment form pre-fills loan when coming from loan detail
- [x] Transaction type dropdown filters based on loan type
- [x] Effective date field appears only for INTEREST_PAYMENT
- [x] Pending approvals list shows all PENDING transactions
- [x] Approve action removes item from list optimistically
- [x] Reject requires reason, removes from list
- [x] Transaction history loads with infinite scroll and all filters
- [x] Reversal flow: bottom sheet shows original details, creates corrective transaction
- [x] Already-corrected transactions cannot be reversed again
- [x] Corrective transactions shown with negative amount in red
- [x] Empty state on pending approvals: "All caught up!"

---

## Phase 5: Customer Management

**Goal:** Customer list, detail, create/edit forms.

**Depends on:** Phase 1 (can run in parallel with Phase 3/4 for the standalone pages)

### 5.1 Customers API module

**File:** `src/lib/api/customers.api.ts`

| Function | Endpoint |
|----------|----------|
| `listCustomers(params)` | `GET /customers` |
| `getCustomer(id)` | `GET /customers/:id` |
| `createCustomer(body)` | `POST /customers` |
| `updateCustomer(id, body)` | `PUT /customers/:id` |
| `getCustomerLoans(id)` | `GET /customers/:id/loans` |

### 5.2 Customer types, schemas, hooks

**Files:**

| File | Contents |
|------|----------|
| `src/features/customers/types.ts` | `ListCustomersParams` |
| `src/features/customers/schemas.ts` | `createCustomerSchema`, `updateCustomerSchema` (Zod) |
| `src/features/customers/hooks/use-customers.ts` | `useInfiniteQuery` for customer list |
| `src/features/customers/hooks/use-customer-detail.ts` | `useQuery` for single customer |
| `src/features/customers/hooks/use-customer-loans.ts` | `useQuery` for customer's loans |
| `src/features/customers/hooks/use-create-customer.ts` | `useMutation` |
| `src/features/customers/hooks/use-update-customer.ts` | `useMutation` |

### 5.3 Customer List page (A13)

**Files:**

| File | Contents |
|------|----------|
| `src/app/(app)/(admin)/customers/page.tsx` | Customer list page |
| `src/features/customers/components/customer-card.tsx` | Card: name, phone, defaulter flag badge |
| `src/features/customers/components/customer-list-filters.tsx` | Search input (name/phone), defaulter toggle (All/Defaulters/Non-Defaulters) |

- Infinite scroll
- FAB: "New Customer" → `/customers/new`
- Empty state: "No customers yet. Add your first customer."

### 5.4 Customer Detail page (A14)

**Files:**

| File | Contents |
|------|----------|
| `src/app/(app)/(admin)/customers/[id]/page.tsx` | Customer detail page |
| `src/features/customers/components/customer-detail.tsx` | Customer info, edit button, guarantor warnings |
| `src/features/customers/components/guarantor-warning-banner.tsx` | Warning if customer is guarantor for defaulted/written-off loans. Shows loan number, borrower name, status |
| `src/features/customers/components/customer-loans-list.tsx` | List of customer's loans with status badges. Tap → loan detail |

### 5.5 Create/Edit Customer (A15)

**Files:**

| File | Contents |
|------|----------|
| `src/app/(app)/(admin)/customers/new/page.tsx` | Create customer page |
| `src/features/customers/components/customer-form.tsx` | Shared form for create + edit. Fields: name, phone, alternate phone, address, Aadhaar, PAN, ID proof type, occupation, notes |

- Edit mode: pre-populate from existing data, submit via `updateCustomer`
- Edit can be accessed from customer detail page (inline navigation or modal)

**Acceptance criteria:**
- [x] Customer list loads with infinite scroll, search, and defaulter filter
- [x] Customer detail shows all info fields
- [x] Guarantor warning banner shows for customers guaranteeing defaulted loans
- [x] Customer's loans list navigates to loan detail
- [x] Create customer form validates required fields (name, phone)
- [x] Edit customer pre-populates form
- [x] Customer picker in Create Loan form uses the same search API

---

## Phase 6: Penalties & Waivers

**Goal:** Impose penalties, waive penalties, waive interest, penalty list.

**Depends on:** Phase 3 (loan detail must exist)

### 6.1 Penalties API module

**File:** `src/lib/api/penalties.api.ts`

| Function | Endpoint |
|----------|----------|
| `imposePenalty(loanId, body?)` | `POST /loans/:id/penalties` |
| `getLoanPenalties(loanId)` | `GET /loans/:id/penalties` |
| `waivePenalty(penaltyId, body)` | `PATCH /penalties/:id/waive` |
| `waiveInterest(loanId, body)` | `POST /loans/:id/waive-interest` |
| `getLoanWaivers(loanId)` | `GET /loans/:id/waivers` |

### 6.2 Penalty types, schemas, hooks

**Files:**

| File | Contents |
|------|----------|
| `src/features/penalties/types.ts` | `ImposePenaltyResponse` (includes calculated amount, incremental months) |
| `src/features/penalties/schemas.ts` | `imposePenaltySchema`, `waivePenaltySchema`, `waiveInterestSchema` (Zod) |
| `src/features/penalties/hooks/use-penalties.ts` | `useQuery` for loan's penalties |
| `src/features/penalties/hooks/use-impose-penalty.ts` | `useMutation` → invalidate penalties + loan detail |
| `src/features/penalties/hooks/use-waive-penalty.ts` | `useMutation` |
| `src/features/penalties/hooks/use-waive-interest.ts` | `useMutation` |

### 6.3 Impose Penalty (A16)

**File:** `src/features/penalties/components/impose-penalty-form.tsx`

- Shows: days overdue, incremental months (auto-calculated), calculated penalty amount
- Admin can confirm system-calculated amount or override
- Accessed from daily loan detail's "Impose Penalty" action

### 6.4 Waive Penalty (A17)

**File:** `src/features/penalties/components/waive-penalty-form.tsx`

- Select penalty from list
- Enter waive amount (full or partial)
- Optional notes
- Bottom sheet or inline form on penalty list

### 6.5 Waive Interest (A18)

**File:** `src/features/penalties/components/waive-interest-form.tsx`

- Select billing cycle (effective date)
- Enter waive amount
- Optional notes
- Accessed from monthly loan detail

### 6.6 Penalty List (A19)

**File:** `src/features/penalties/components/penalty-list.tsx`

- List of penalties for a loan
- Each row: status badge, penalty amount, waived amount, net payable, amount collected
- Actions: Waive (on pending/partially paid)

### 6.7 Integration with Loan Detail

- Monthly detail (A6): "Waive Interest" action opens waive interest form
- Daily detail (A7): "Impose Penalty" action (visible only when overdue), penalty list section
- Penalty payments go through the Record Payment form (A10) with `PENALTY` transaction type

**Acceptance criteria:**
- [x] Impose penalty shows auto-calculated incremental months and amount
- [x] Admin can override penalty amount
- [x] Waive penalty accepts full or partial amount
- [x] Waive interest targets a specific billing cycle
- [x] Penalty list shows correct statuses and amounts
- [x] Penalty status badges use correct colors (amber/blue/green/grey)
- [x] Impose Penalty button only visible on overdue daily loans

---

## Phase 7: Collector Experience

**Goal:** Collector's daily workflow — collections today, record collection, bulk collection, read-only views.

**Depends on:** Phase 4 (transaction creation must work)

### 7.1 Collector-specific hooks

**Files:**

| File | Contents |
|------|----------|
| `src/features/collector/types.ts` | `CollectionTodayItem` |
| `src/features/collector/hooks/use-collections-today.ts` | `useQuery` → `GET /loans` filtered for active daily loans |

### 7.2 My Collections Today (C1)

**Files:**

| File | Contents |
|------|----------|
| `src/app/(app)/(collector)/today/page.tsx` | Collections today page |
| `src/features/collector/components/collections-today.tsx` | Main list view |
| `src/features/collector/components/cash-handover-card.tsx` | Summary card at top: "Today's Collections: X items, Rs Y total" (running tally from submitted collections today) |
| `src/features/collector/components/daily-loan-item.tsx` | Each loan: borrower name, phone (tap-to-call), daily amount, address. "Submitted" indicator if already recorded today |

- Tap loan → Record Collection (C2)
- FAB: "Bulk Submit" → Bulk Collection (C3)
- Pull-to-refresh

### 7.3 Record Collection (C2)

**File:** `src/app/(app)/(collector)/today/record/page.tsx`

- Simplified version of Record Payment (A10) — only `DAILY_COLLECTION` type
- Pre-filled: loan (from navigation), daily amount
- Collector can adjust amount
- On submit: status = PENDING (awaits admin approval)
- Toast: "Collection submitted. Pending admin approval."
- Navigate back to C1 with "submitted" indicator on that loan

### 7.4 Bulk Collection (C3)

**Files:**

| File | Contents |
|------|----------|
| `src/app/(app)/(collector)/today/bulk/page.tsx` | Bulk collection page |
| `src/features/transactions/components/bulk-collection-form.tsx` | Multi-row form |
| `src/features/transactions/components/bulk-result-modal.tsx` | Submission result bottom sheet |

**Bulk form:**
- Header: date picker (default today)
- Rows: loan picker + amount (pre-filled with daily amount) + remove button
- "Add Row" button
- Footer: total count, total amount, Submit button
- Submit with `Idempotency-Key` header

**Result modal (BRD Section 8.5):**
- Summary: "X of Y collections submitted" (green/amber/red based on success rate)
- Per-item results: green checkmark + "Pending Approval" for success, red X + error reason for failures
- Actions: "Done" (dismiss, refresh C1) / "Retry Failed" (keep only failed rows)

### 7.5 Collector Loan List (C4) & Detail (C5)

**Files:**

| File | Contents |
|------|----------|
| `src/app/(app)/(collector)/loans/page.tsx` | Read-only loan list (status=ACTIVE only) |
| `src/app/(app)/(collector)/loans/[id]/page.tsx` | Read-only loan detail |

- Reuses `loan-card.tsx` and loan detail components from Phase 3
- No action buttons (no create, edit, close, default, etc.)
- Only shows ACTIVE loans

### 7.6 Collector Customer List (C6) & Detail (C7)

**Files:**

| File | Contents |
|------|----------|
| `src/app/(app)/(collector)/customers/page.tsx` | Read-only customer list |
| `src/app/(app)/(collector)/customers/[id]/page.tsx` | Read-only customer detail |

- Reuses customer components from Phase 5
- No create/edit actions

### 7.7 Collector Profile

**File:** `src/app/(app)/(collector)/profile/page.tsx`

- Reuses shared profile page
- Links to change password

**Acceptance criteria:**
- [x] My Collections Today shows active daily loans with borrower info
- [x] Cash Handover card shows running total of today's collections
- [x] Tap loan → Record Collection with pre-filled values
- [x] Collection submission shows "Pending Approval" status
- [x] Submitted loans show indicator in list
- [x] Bulk collection form supports add/remove rows
- [x] Bulk submit sends idempotency key
- [x] Result modal shows per-item success/failure with reasons
- [x] "Retry Failed" keeps only failed rows
- [x] Collector loan list only shows ACTIVE loans
- [x] Collector has no access to create/edit/status-change actions
- [x] Phone numbers are tap-to-call

---

## Phase 8: Financial Management

**Goal:** Expenses CRUD, fund management, and all three report views.

**Depends on:** Phase 2 (dashboard), Phase 3 (loans exist)

### 8.1 Expenses API module

**File:** `src/lib/api/expenses.api.ts`

| Function | Endpoint |
|----------|----------|
| `listExpenses(params)` | `GET /expenses` (filters: category, from, to) |
| `createExpense(body)` | `POST /expenses` |
| `updateExpense(id, body)` | `PUT /expenses/:id` |
| `deleteExpense(id)` | `PATCH /expenses/:id/delete` |

### 8.2 Fund API module

**File:** `src/lib/api/fund.api.ts`

| Function | Endpoint |
|----------|----------|
| `listFundEntries(params)` | `GET /fund/entries` |
| `createFundEntry(body)` | `POST /fund/entries` |
| `getFundSummary()` | `GET /fund/summary` |

### 8.3 Reports API module

**File:** `src/lib/api/reports.api.ts`

| Function | Endpoint |
|----------|----------|
| `getProfitLoss(from, to)` | `GET /reports/profit-loss` |
| `getCollectorSummary(from, to)` | `GET /reports/collector-summary` |
| `getLoanBook()` | `GET /reports/loan-book` |

### 8.4 Feature modules (types, schemas, hooks)

**Expenses:**

| File | Contents |
|------|----------|
| `src/features/expenses/schemas.ts` | `createExpenseSchema` |
| `src/features/expenses/hooks/use-expenses.ts` | `useInfiniteQuery` |
| `src/features/expenses/hooks/use-create-expense.ts` | `useMutation` |
| `src/features/expenses/hooks/use-update-expense.ts` | `useMutation` |
| `src/features/expenses/hooks/use-delete-expense.ts` | `useMutation` with confirmation |

**Fund:**

| File | Contents |
|------|----------|
| `src/features/fund/schemas.ts` | `createFundEntrySchema` |
| `src/features/fund/hooks/use-fund-entries.ts` | `useInfiniteQuery` |
| `src/features/fund/hooks/use-create-fund-entry.ts` | `useMutation` |
| `src/features/fund/hooks/use-fund-summary.ts` | `useQuery` |

**Reports:**

| File | Contents |
|------|----------|
| `src/features/reports/hooks/use-profit-loss.ts` | `useQuery` with date range params |
| `src/features/reports/hooks/use-collector-summary.ts` | `useQuery` with date range params |
| `src/features/reports/hooks/use-loan-book.ts` | `useQuery` |

### 8.5 Expenses page (A21)

**Files:**

| File | Contents |
|------|----------|
| `src/app/(app)/(admin)/money/expenses/page.tsx` | Expenses list page |
| `src/features/expenses/components/expense-list.tsx` | Filterable list by category and date range |
| `src/features/expenses/components/expense-form.tsx` | Create/edit form: category (dropdown), amount, description, date |

- FAB or button: "Add Expense"
- Inline edit and soft-delete with confirmation

### 8.6 Fund Management page (A22)

**Files:**

| File | Contents |
|------|----------|
| `src/app/(app)/(admin)/money/page.tsx` | Fund management page |
| `src/features/fund/components/fund-entries-list.tsx` | List of injections and withdrawals |
| `src/features/fund/components/fund-entry-form.tsx` | Create form: entry type toggle (Injection/Withdrawal), amount, description, date |
| `src/features/fund/components/fund-summary-cards.tsx` | KPI cards (reuses same logic as dashboard fund summary) |

### 8.7 Money tab navigation

The Money tab (`/money`) serves as the hub:
- Default view: Fund Management (A22) with fund summary
- Sub-navigation or links to: Expenses, Reports (P&L, Collector Summary, Loan Book)
- FAB: "New Entry" for fund entry creation

### 8.8 Reports pages

**Files:**

| File | Contents |
|------|----------|
| `src/app/(app)/(admin)/money/reports/profit-loss/page.tsx` | P&L report with date range selector |
| `src/app/(app)/(admin)/money/reports/collector-summary/page.tsx` | Per-collector stats with date range |
| `src/app/(app)/(admin)/money/reports/loan-book/page.tsx` | Full loan book: all loans with outstanding amounts |
| `src/features/reports/components/date-range-picker.tsx` | From/To date pickers with presets (This Month, Last Month, This Year) |
| `src/features/reports/components/profit-loss-report.tsx` | P&L breakdown display |
| `src/features/reports/components/collector-summary-report.tsx` | Per-collector table: collections, approvals, rejections |
| `src/features/reports/components/loan-book-report.tsx` | Full loan table with outstanding amounts and interest earned |

**Acceptance criteria:**
- [x] Expenses list shows category, amount, date with filters
- [x] Create/edit/delete expenses works with soft-delete confirmation
- [x] Fund entries list shows injections and withdrawals
- [x] Create fund entry with type toggle
- [x] Fund summary KPIs display correctly
- [x] P&L report shows breakdown for selected date range
- [x] Collector summary shows per-collector performance
- [x] Loan book shows all loans with outstanding amounts
- [x] Date range pickers work with presets
- [x] All currency amounts formatted correctly

---

## Phase 9: Admin Features (User Management & Loan Migration)

**Goal:** User management, loan migration, and completing all loan status actions.

**Depends on:** Phase 3 (loans), Phase 5 (customers)

### 9.1 Users API module

**File:** `src/lib/api/users.api.ts`

| Function | Endpoint |
|----------|----------|
| `listUsers()` | `GET /users` |
| `createUser(body)` | `POST /users` |
| `updateUser(id, body)` | `PUT /users/:id` |
| `deactivateUser(id)` | `PATCH /users/:id/deactivate` |
| `resetPassword(id)` | `POST /users/:id/reset-password` |

### 9.2 User management types, schemas, hooks

**Files:**

| File | Contents |
|------|----------|
| `src/features/users/schemas.ts` | `createUserSchema` (Zod): name, phone, password, role=COLLECTOR |
| `src/features/users/hooks/use-users.ts` | `useQuery` for user list |
| `src/features/users/hooks/use-create-user.ts` | `useMutation` |
| `src/features/users/hooks/use-deactivate-user.ts` | `useMutation` with confirmation |
| `src/features/users/hooks/use-reset-password.ts` | `useMutation` |

### 9.3 User Management page (A20)

**Files:**

| File | Contents |
|------|----------|
| `src/app/(app)/(admin)/more/users/page.tsx` | User management page |
| `src/features/users/components/user-list.tsx` | List of tenant users with role, active status |
| `src/features/users/components/create-user-form.tsx` | Create collector: name, phone, password |
| `src/features/users/components/user-actions.tsx` | Deactivate (with confirmation), reset password |

- Only collectors can be created (admin is created at tenant onboarding)
- Deactivation confirmation: "This will revoke their access immediately."

### 9.4 Migrate Loan (A9)

**Files:**

| File | Contents |
|------|----------|
| `src/app/(app)/(admin)/loans/migrate/page.tsx` | Migrate loan page |
| `src/features/loans/schemas.ts` | Add `migrateMonthlyLoanSchema`, `migrateDailyLoanSchema` |
| `src/features/loans/components/migrate-loan-form.tsx` | Similar to create form with migration-specific fields |
| `src/features/loans/hooks/use-migrate-loan.ts` | `useMutation` wrapping `POST /loans/migrate` |

**Migration-specific fields:**
- Monthly: `remaining_principal`, `last_interest_paid_through` (date)
- Daily: `total_base_collected_so_far`, `pre_existing_penalties[]` (optional array of penalty objects)

Add `migrateLoan()` to `src/lib/api/loans.api.ts`.

### 9.5 More menu page

**File:** `src/app/(app)/(admin)/more/page.tsx`

- Navigation list:
  - Pending Approvals (with badge count)
  - Transaction History
  - User Management
  - Profile
  - Change Password
  - Logout

**Acceptance criteria:**
- [x] User list shows all tenant users with role and status
- [x] Create collector with name, phone, password
- [x] Deactivate user shows confirmation, revokes access
- [x] Reset password generates new password for user
- [x] Migrate Loan form has migration-specific fields
- [x] Monthly migration: remaining principal and last interest paid through
- [x] Daily migration: total collected so far and optional pre-existing penalties
- [x] More menu items navigate to correct pages with badges

---

## Phase 10: Super Admin (Platform Management)

**Goal:** Platform dashboard, tenant management (list, detail, onboard, suspend/activate).

**Depends on:** Phase 1 (super admin shell layout)

### 10.1 Platform API module

**File:** `src/lib/api/platform.api.ts`

| Function | Endpoint |
|----------|----------|
| `getPlatformStats()` | `GET /platform/stats` |
| `listTenants(params)` | `GET /platform/tenants` |
| `getTenant(id)` | `GET /platform/tenants/:id` |
| `createTenant(body)` | `POST /platform/tenants` |
| `suspendTenant(id)` | `PATCH /platform/tenants/:id/suspend` |
| `activateTenant(id)` | `PATCH /platform/tenants/:id/activate` |

### 10.2 Platform types, schemas, hooks

**Files:**

| File | Contents |
|------|----------|
| `src/features/platform/types.ts` | `PlatformStats`, `TenantDetail` |
| `src/features/platform/schemas.ts` | `createTenantSchema` (Zod): business name, slug, owner details, admin name, phone, password |
| `src/features/platform/hooks/use-platform-stats.ts` | `useQuery` |
| `src/features/platform/hooks/use-tenants.ts` | `useInfiniteQuery` |
| `src/features/platform/hooks/use-tenant-detail.ts` | `useQuery` |
| `src/features/platform/hooks/use-create-tenant.ts` | `useMutation` |
| `src/features/platform/hooks/use-tenant-actions.ts` | `useMutation` for suspend/activate |

### 10.3 Platform Dashboard (P1)

**File:** `src/app/(app)/(platform)/platform/page.tsx`

- Tenant counts: active, suspended, deactivated
- Total loans, total users across all tenants
- Card-based layout optimized for desktop/tablet

### 10.4 Tenant List (P2)

**Files:**

| File | Contents |
|------|----------|
| `src/app/(app)/(platform)/platform/tenants/page.tsx` | Tenant list with filters |
| `src/features/platform/components/tenant-card.tsx` | Tenant name, status badge, owner, creation date |

- Filterable by status
- Pagination

### 10.5 Tenant Detail (P3)

**File:** `src/app/(app)/(platform)/platform/tenants/[id]/page.tsx`

- Tenant info: name, slug, owner, status, created at
- Summary stats: active loans count, users count, customers count
- Actions: Suspend / Activate (with confirmation dialog)

### 10.6 Onboard Tenant (P4)

**Files:**

| File | Contents |
|------|----------|
| `src/app/(app)/(platform)/platform/tenants/new/page.tsx` | Onboard tenant page |
| `src/features/platform/components/onboard-tenant-form.tsx` | Two-section form: tenant info + first admin account |

**Form fields:**
- Tenant: business name, slug, owner name, owner phone, owner email (optional), address (optional)
- First Admin: name, phone, password
- On success → navigate to Tenant Detail

**Acceptance criteria:**
- [x] Platform dashboard shows tenant counts and total stats
- [x] Tenant list shows all tenants with status badges
- [x] Tenant detail shows summary stats and actions
- [x] Onboard tenant creates both tenant and first admin
- [x] Suspend/Activate toggles tenant status with confirmation
- [x] Super Admin sidebar navigation works correctly
- [x] Super Admin cannot access any tenant-level routes

---

## Phase 11: PWA, Offline Support & Polish

**Goal:** Service worker, offline caching, install prompt, performance optimization, and comprehensive UX polish.

**Depends on:** All previous phases (this is the polish layer)

### 11.1 PWA Configuration

**Files:**

| File | Contents |
|------|----------|
| `next.config.ts` | Add `next-pwa` configuration with runtime caching rules (tech spec Section 10.1) |
| `public/manifest.json` | Web app manifest: name, icons, theme color `#1e40af`, display standalone |
| `public/icons/` | PWA icons: `icon-192.png`, `icon-512.png`, `icon-maskable.png` |

**Runtime caching:**
- Static assets (JS, CSS, fonts): `StaleWhileRevalidate`
- API GETs (dashboard, loans, customers, fund, reports): `NetworkFirst` with 5s timeout, fallback to cache. Max 100 entries, 24h max age.

### 11.2 IndexedDB Offline Cache

**File:** `src/lib/offline-db.ts`

- Database schema with stores: `dashboardCache`, `loanCache`, `customerCache`
- Each entry: `{ data: unknown, cachedAt: number }`
- Max age: 24 hours — entries older than this purged on app open
- Stale-while-revalidate: serve cached data immediately, refresh in background

### 11.3 Offline UX

- **`OfflineBanner`** (already created in Phase 1): orange bar at top when offline
- Disable all submit/action buttons when offline: wrap mutation buttons with `useOnlineStatus` check
- Tooltip on disabled buttons: "Requires network connection"
- Still functional offline: browsing cached lists, viewing cached details, navigating
- Network restored: auto-dismiss banner, re-enable buttons, trigger background revalidation

### 11.4 Install Prompt

**File:** `src/hooks/use-install-prompt.ts`

- Listen for `beforeinstallprompt` event
- Show custom install banner/button after 2nd visit (store visit count in localStorage)
- Call `prompt()` on user action

### 11.5 Performance Optimization

- Verify all pages use skeleton loading (not spinners)
- Dynamic imports (`next/dynamic`) for heavy components (calendar, charts)
- Image optimization via `next/image` for any icons/illustrations
- Bundle analysis: `@next/bundle-analyzer` — identify and tree-shake unused code
- Verify targets: FCP < 2s, TTI < 4s on 3G

### 11.6 Comprehensive Empty States

Verify every list screen has a meaningful empty state:

| Screen | Empty State Message |
|--------|-------------------|
| Loan List | "No loans yet. Create your first loan to get started." |
| Pending Approvals | "All caught up! No pending approvals." |
| Today's Missed | "Great! All daily collections received today." |
| Customer List | "No customers yet. Add your first customer." |
| Transaction History | "No transactions found." |
| Expenses | "No expenses recorded." |
| Fund Entries | "No fund entries yet." |
| Collections Today (Collector) | "No active collections today." |
| Tenant List | "No tenants yet." |

### 11.7 Loading Skeletons

- Verify skeleton screens exist for all list and dashboard pages
- Use `Skeleton` component from shadcn/ui
- Match approximate layout of loaded state

### 11.8 Error Handling Polish

- Toast notifications (via Sonner) for transient errors
- Inline field errors mapped from API `details` array
- Full-screen error state for auth expired / tenant suspended
- "Retry" button on failed data loads

### 11.9 Confirmation Dialogs Audit

Verify confirmation dialogs exist for all destructive actions:
- Reverse Transaction
- Mark as Defaulted
- Write Off
- Cancel Loan
- Close Loan
- Deactivate User
- Suspend/Activate Tenant
- Delete Expense

### 11.10 Responsive Design Audit

- Test all screens at mobile (< 640px), tablet (768px), desktop (1024px+)
- Verify touch targets are 44x44px minimum
- Verify bottom tab bar is not obscured by mobile browser chrome
- Super Admin: verify sidebar layout works at tablet and desktop

**Acceptance criteria:**
- [x] App installable on Android/iOS via "Add to Home Screen"
- [x] Lighthouse PWA score > 90
- [x] Service worker caches API responses
- [x] Offline: cached data browsable, write buttons disabled, orange banner shown
- [x] Online restored: banner dismissed, buttons re-enabled, data refreshes
- [x] FCP < 2s and TTI < 4s on simulated 3G
- [x] Every list screen has empty state
- [x] Every list screen has skeleton loading
- [x] All destructive actions have confirmation dialogs
- [x] All touch targets are 44x44px minimum

---

## Phase 12: Testing

**Goal:** Comprehensive test coverage across unit, component, and E2E layers.

**Depends on:** All feature phases complete

### 12.1 Unit Tests (Vitest)

**Already started in Phase 0. Expand to cover:**

| Module | Tests |
|--------|-------|
| `utils/currency.ts` | `formatCurrency` with various amounts (0, decimals, lakhs, crores) |
| `utils/date.ts` | `formatDate`, `formatTimestamp`, `todayString` |
| `utils/case-transform.ts` | Nested objects, arrays, edge cases |
| `utils/idempotency.ts` | Returns valid UUID, uniqueness |
| `lib/query-keys.ts` | Key factory returns deterministic keys |
| `stores/auth-store.ts` | `setAuth`, `setTokens`, `clearAuth`, persistence behavior |
| All Zod schemas | Valid and invalid input cases |

### 12.2 Component Tests (React Testing Library)

| Component | Test Cases |
|-----------|-----------|
| `LoginForm` | Submit with valid/invalid data, loading state, error display, API error mapping |
| `StatusBadge` | Correct color per status (loan, transaction, penalty variants) |
| `CurrencyDisplay` | Indian format rendering |
| `CurrencyInput` | Numeric-only, format preview |
| `DatePicker` | Returns YYYY-MM-DD string, no timezone issues |
| `EmptyState` | Renders title, description, CTA |
| `LoanCard` | Correct data display, navigation on tap |
| `CreateLoanForm` | Type toggle switches fields, live calc updates, validation |
| `BulkCollectionForm` | Add/remove rows, total calculation |
| `PendingTransactionCard` | Approve/reject actions |

### 12.3 API Mocking (MSW v2)

**File:** `src/test/mocks/handlers.ts`

- Mock all API endpoints used in tests
- Return realistic fixture data
- Support error scenarios (401, 403, 404, 422, 500)

**File:** `src/test/mocks/server.ts`

- MSW setup for test environment

### 12.4 E2E Tests (Playwright)

**File:** `e2e/` directory

| Test | Flow |
|------|------|
| `auth.spec.ts` | Login → lands on dashboard, logout → lands on login, invalid credentials → error |
| `loan-lifecycle.spec.ts` | Create loan → appears in list → record payment → shows in transactions → close loan |
| `collector-flow.spec.ts` | Collector login → see collections → record single → bulk collection → result modal |
| `approval-flow.spec.ts` | Collector submits → admin sees pending → approve → transaction approved |
| `reversal-flow.spec.ts` | Admin reverses approved transaction → original shows "Corrected" |
| `penalty-flow.spec.ts` | Daily loan overdue → impose penalty → record penalty payment |
| `offline.spec.ts` | Disconnect → orange banner → buttons disabled → reconnect → banner dismissed |
| `role-guard.spec.ts` | Each role redirected from unauthorized routes |

**Acceptance criteria:**
- [x] Unit test coverage > 80% for utility modules
- [x] Component tests pass for all critical form and display components
- [x] E2E tests cover all core user flows
- [x] MSW mocks cover all API endpoints
- [x] CI pipeline runs all tests on PR

---

## Dependency Graph

```
Phase 0: Scaffolding
  │
  └── Phase 1: Auth & Layout
        │
        ├── Phase 2: Dashboard ──────────────────┐
        │     │                                   │
        │     └── Phase 3: Loan Management ──────┤
        │           │                             │
        │           ├── Phase 4: Payments ────────┤
        │           │                             │
        │           ├── Phase 6: Penalties ───────┤
        │           │                             │
        │           └── Phase 9: Admin Features ──┤
        │                                         │
        ├── Phase 5: Customers ───────────────────┤
        │                                         │
        ├── Phase 7: Collector ───────────────────┤
        │     (depends on Phase 4)                │
        │                                         │
        ├── Phase 8: Financial Mgmt ──────────────┤
        │     (depends on Phase 2, 3)             │
        │                                         │
        ├── Phase 10: Super Admin ────────────────┤
        │                                         │
        └──────── Phase 11: PWA & Polish ─────────┤
                                                  │
                  Phase 12: Testing ──────────────┘
```

**Parallelizable:**
- Phase 5 (Customers) can start after Phase 1, in parallel with Phase 2/3
- Phase 10 (Super Admin) can start after Phase 1, in parallel with other phases
- Phase 8 (Financial Mgmt) can start after Phase 2 + 3

---

## File Count Summary

| Category | Estimated Files |
|----------|----------------|
| Route pages (`page.tsx`) | ~35 |
| Layout files (`layout.tsx`, `loading.tsx`, `error.tsx`) | ~12 |
| Feature components | ~50 |
| Feature hooks | ~35 |
| Feature schemas | ~10 |
| Feature types | ~12 |
| Shared components | ~16 |
| API modules | ~11 |
| Stores | 2 |
| Utility modules | 4 |
| Global hooks | 4 |
| Type definition files | 4 |
| Config files | ~8 |
| Test files | ~30 |
| **Total** | **~230** |

---

## Key Technical Decisions & Guardrails

1. **No frontend financial arithmetic** — all calculations are backend-side. Live previews on Create Loan form are display-only approximations.

2. **Dates are strings** — `YYYY-MM-DD` format throughout. Never pass `Date` objects across boundaries. This prevents timezone-induced shifts.

3. **Request body: camelCase → snake_case** — handled by Axios request interceptor. Response body arrives in camelCase (no transform needed), except login response which is manually mapped.

4. **Idempotency keys** — generated via `crypto.randomUUID()` on form mount. Stored in `useRef`. Sent as `Idempotency-Key` header on all POST mutations.

5. **Access token in memory only** — never persisted to localStorage. Refresh token is persisted. This minimizes XSS exposure.

6. **No offline writes** — V1 only supports offline reads via IndexedDB cache. All write operations require network. No offline queue or sync.

7. **Optimistic updates** — only for approve/reject actions. All other mutations use standard invalidation after success.

8. **Role-based route protection** — enforced at layout level. Wrong role → redirect to role's home screen. API also enforces, but frontend provides immediate UX feedback.

9. **No dark mode** — light theme only. Single set of CSS variables consumed by shadcn/ui.

10. **No global search** — each list has its own search/filter. Global search deferred beyond V1.
