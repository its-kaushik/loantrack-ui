export const queryKeys = {
  dashboard: {
    today: () => ['dashboard', 'today'] as const,
    overdue: () => ['dashboard', 'overdue'] as const,
    defaulters: () => ['dashboard', 'defaulters'] as const,
    fundSummary: () => ['dashboard', 'fund-summary'] as const,
  },
  loans: {
    all: () => ['loans'] as const,
    list: (filters: Record<string, unknown>) => ['loans', 'list', filters] as const,
    detail: (id: string) => ['loans', 'detail', id] as const,
    transactions: (id: string, f?: Record<string, unknown>) =>
      ['loans', id, 'transactions', f] as const,
    paymentStatus: (id: string) => ['loans', id, 'payment-status'] as const,
    penalties: (id: string) => ['loans', id, 'penalties'] as const,
  },
  transactions: {
    all: () => ['transactions'] as const,
    list: (filters: Record<string, unknown>) => ['transactions', 'list', filters] as const,
    pending: (f?: Record<string, unknown>) => ['transactions', 'pending', f] as const,
  },
  customers: {
    all: () => ['customers'] as const,
    list: (filters: Record<string, unknown>) => ['customers', 'list', filters] as const,
    detail: (id: string) => ['customers', 'detail', id] as const,
    loans: (id: string) => ['customers', id, 'loans'] as const,
  },
  expenses: {
    list: (f: Record<string, unknown>) => ['expenses', 'list', f] as const,
  },
  fund: {
    entries: (f?: Record<string, unknown>) => ['fund', 'entries', f] as const,
    summary: () => ['fund', 'summary'] as const,
  },
  reports: {
    profitLoss: (from: string, to: string) => ['reports', 'pl', from, to] as const,
    collectorSummary: (from: string, to: string) => ['reports', 'cs', from, to] as const,
    loanBook: () => ['reports', 'loan-book'] as const,
  },
  users: {
    list: () => ['users', 'list'] as const,
  },
  platform: {
    stats: () => ['platform', 'stats'] as const,
    tenants: {
      list: (f?: Record<string, unknown>) => ['platform', 'tenants', f] as const,
      detail: (id: string) => ['platform', 'tenants', id] as const,
    },
  },
} as const;
