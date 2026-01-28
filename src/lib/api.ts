/**
 * LoanTrack API Client
 * Auto-generated from OpenAPI specification
 * Base URL: Configure via API_BASE_URL constant
 */

// ============================================================================
// Configuration
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

// ============================================================================
// Types & Interfaces
// ============================================================================

// Enums
export type UserRole = 'ADMIN' | 'MANAGER' | 'AGENT';
export type LoanStatus = 'PENDING' | 'ACTIVE' | 'CLOSED' | 'DEFAULTED';
export type TransactionType = 'PRINCIPAL' | 'INTEREST' | 'PENALTY' | 'DAILY_PAYMENT';
export type CollateralStatus = 'HELD' | 'RELEASED' | 'FORFEITED';

// Meta & Pagination
export interface Meta {
  requestId?: string;
  timestamp?: string;
  path?: string;
  version?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Error handling
export interface ErrorDetail {
  field?: string;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: ErrorDetail[];
}

export interface ErrorResponse {
  success: false;
  error: ApiError;
  meta?: Meta;
}

// Success response wrapper
export interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  meta?: Meta;
  pagination?: Pagination;
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileRequest {
  name?: string;
}

export interface UpdateUserRoleRequest {
  role: UserRole;
}

// User
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Borrower
export interface Borrower {
  id: string;
  fullName: string;
  phone: string;
  altPhone?: string;
  address: string;
  city: string;
  idDocumentType?: string;
  idDocumentNumber?: string;
  occupation?: string;
  monthlyIncome?: number;
  photoUrl?: string;
  isBlacklisted: boolean;
  blacklistReason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBorrowerRequest {
  fullName: string;
  phone: string;
  altPhone?: string;
  address: string;
  city: string;
  idDocumentType?: string;
  idDocumentNumber?: string;
  occupation?: string;
  monthlyIncome?: number;
  photoUrl?: string;
  notes?: string;
}

export interface UpdateBorrowerRequest extends Partial<CreateBorrowerRequest> {}

export interface BorrowerStats {
  totalLoans: number;
  activeLoans: number;
  closedLoans: number;
  totalBorrowed: number;
  totalRepaid: number;
}

export interface BlacklistRequest {
  reason: string;
}

// Guarantor
export interface Guarantor {
  id: string;
  borrowerId: string;
  fullName: string;
  phone: string;
  relationship: string;
  address?: string;
  occupation?: string;
  monthlyIncome?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGuarantorRequest {
  borrowerId: string;
  fullName: string;
  phone: string;
  relationship: string;
  address?: string;
  occupation?: string;
  monthlyIncome?: number;
}

export interface UpdateGuarantorRequest extends Partial<Omit<CreateGuarantorRequest, 'borrowerId'>> {}

// Loan
export interface Loan {
  id: string;
  loanNumber: string;
  borrowerId: string;
  loanTypeId: string;
  principalAmount: number;
  interestRate: number;
  termMonths?: number;
  termDays?: number;
  dailyInstallment?: number;
  totalExpectedInterest: number;
  totalExpectedAmount: number;
  startDate: string;
  maturityDate: string;
  status: LoanStatus;
  totalPrincipalPaid: number;
  totalInterestPaid: number;
  totalPenaltyPaid: number;
  outstandingPrincipal: number;
  outstandingInterest: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLoanRequest {
  borrowerId: string;
  loanTypeId: string;
  principalAmount: number;
  interestRate: number;
  termMonths?: number;
  termDays?: number;
  startDate?: string;
  notes?: string;
}

export interface UpdateLoanStatusRequest {
  status: LoanStatus;
}

export interface CollectDailyPaymentRequest {
  dayNumber: number;
  paymentDate?: string;
  notes?: string;
}

export interface CollectInterestRequest {
  amount: number;
  paymentDate?: string;
  scheduleId?: string;
  notes?: string;
}

export interface CollectPrincipalRequest {
  amount: number;
  paymentDate?: string;
  notes?: string;
}

export interface CollectPenaltyRequest {
  amount: number;
  paymentDate?: string;
  notes?: string;
}

export interface PenaltyCalculation {
  penaltyAmount: number;
  daysOverdue: number;
  penaltyRate: number;
}

// Collateral
export interface Collateral {
  id: string;
  loanId: string;
  itemType: string;
  description: string;
  estimatedValue: number;
  photoUrls?: string[];
  status: CollateralStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCollateralRequest {
  loanId: string;
  itemType: string;
  description: string;
  estimatedValue: number;
  photoUrls?: string[];
}

export interface UpdateCollateralRequest extends Partial<Omit<CreateCollateralRequest, 'loanId'>> {}

export interface ReleaseCollateralRequest {
  notes?: string;
}

// Transaction
export interface Transaction {
  id: string;
  loanId: string;
  type: TransactionType;
  amount: number;
  paymentDate: string;
  notes?: string;
  createdAt: string;
}

// Reports
export interface PortfolioSummary {
  loanType: string;
  totalLoans: number;
  activeLoans: number;
  totalDisbursed: number;
  totalOutstanding: number;
  totalInterestEarned: number;
  totalPenaltyEarned: number;
}

export interface DueCollection {
  loanId: string;
  loanNumber: string;
  borrowerName: string;
  borrowerPhone: string;
  dueAmount: number;
  dueDate: string;
  daysOverdue: number;
}

// Health
export interface HealthStatus {
  status: string;
  timestamp: string;
  uptime: number;
}

// Query Parameters
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface BorrowersQueryParams extends PaginationParams {
  search?: string;
  isBlacklisted?: boolean;
}

export interface LoansQueryParams extends PaginationParams {
  status?: LoanStatus;
  borrowerId?: string;
  loanTypeId?: string;
}

export interface CollateralQueryParams extends PaginationParams {
  status?: CollateralStatus;
}

export interface GuarantorsQueryParams extends PaginationParams {
  borrowerId?: string;
}

export interface ProfitReportParams {
  startDate?: string;
  endDate?: string;
}

// ============================================================================
// API Client Class
// ============================================================================

class ApiClient {
  private baseUrl: string;
  private accessToken: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    // Try to restore token from localStorage
    this.accessToken = localStorage.getItem('accessToken');
  }

  // Token management
  setAccessToken(token: string | null): void {
    this.accessToken = token;
    if (token) {
      localStorage.setItem('accessToken', token);
    } else {
      localStorage.removeItem('accessToken');
    }
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  // Base fetch method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.accessToken) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      const error = data as ErrorResponse;
      throw new ApiError(
        error.error?.code || 'UNKNOWN_ERROR',
        error.error?.message || 'An unknown error occurred',
        response.status,
        error.error?.details
      );
    }

    return data;
  }

  // Helper methods for different HTTP methods
  private get<T>(endpoint: string, params?: Record<string, unknown> | object): Promise<T> {
    const queryString = params ? this.buildQueryString(params as Record<string, unknown>) : '';
    return this.request<T>(`${endpoint}${queryString}`);
  }

  private post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  private put<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  private delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  private buildQueryString(params: Record<string, unknown>): string {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
  }

  // ========================================================================
  // Auth Endpoints
  // ========================================================================

  async register(data: RegisterRequest): Promise<SuccessResponse<User>> {
    return this.post('/auth/register', data);
  }

  async login(data: LoginRequest): Promise<SuccessResponse<LoginResponse>> {
    const response = await this.post<SuccessResponse<LoginResponse>>('/auth/login', data);
    if (response.success && response.data.accessToken) {
      this.setAccessToken(response.data.accessToken);
    }
    return response;
  }

  async refreshToken(data: RefreshTokenRequest): Promise<SuccessResponse<AuthTokens>> {
    const response = await this.post<SuccessResponse<AuthTokens>>('/auth/refresh', data);
    if (response.success && response.data.accessToken) {
      this.setAccessToken(response.data.accessToken);
    }
    return response;
  }

  async logout(): Promise<SuccessResponse<void>> {
    const response = await this.post<SuccessResponse<void>>('/auth/logout');
    this.setAccessToken(null);
    localStorage.removeItem('refreshToken');
    return response;
  }

  async getProfile(): Promise<SuccessResponse<User>> {
    return this.get('/auth/profile');
  }

  async updateProfile(data: UpdateProfileRequest): Promise<SuccessResponse<User>> {
    return this.put('/auth/profile', data);
  }

  async changePassword(data: ChangePasswordRequest): Promise<SuccessResponse<void>> {
    return this.post('/auth/change-password', data);
  }

  async getUsers(params?: PaginationParams): Promise<SuccessResponse<User[]>> {
    return this.get('/auth/users', params);
  }

  async updateUserRole(userId: string, data: UpdateUserRoleRequest): Promise<SuccessResponse<User>> {
    return this.put(`/auth/users/${userId}/role`, data);
  }

  async toggleUserStatus(userId: string): Promise<SuccessResponse<User>> {
    return this.post(`/auth/users/${userId}/toggle-status`);
  }

  // ========================================================================
  // Borrowers Endpoints
  // ========================================================================

  async searchBorrowers(phone: string): Promise<SuccessResponse<Borrower[]>> {
    return this.get('/borrowers/search', { phone });
  }

  async getBorrowers(params?: BorrowersQueryParams): Promise<SuccessResponse<Borrower[]>> {
    return this.get('/borrowers', params);
  }

  async createBorrower(data: CreateBorrowerRequest): Promise<SuccessResponse<Borrower>> {
    return this.post('/borrowers', data);
  }

  async getBorrower(id: string): Promise<SuccessResponse<Borrower>> {
    return this.get(`/borrowers/${id}`);
  }

  async updateBorrower(id: string, data: UpdateBorrowerRequest): Promise<SuccessResponse<Borrower>> {
    return this.put(`/borrowers/${id}`, data);
  }

  async getBorrowerStats(id: string): Promise<SuccessResponse<BorrowerStats>> {
    return this.get(`/borrowers/${id}/stats`);
  }

  async blacklistBorrower(id: string, data: BlacklistRequest): Promise<SuccessResponse<Borrower>> {
    return this.post(`/borrowers/${id}/blacklist`, data);
  }

  async removeFromBlacklist(id: string): Promise<SuccessResponse<Borrower>> {
    return this.delete(`/borrowers/${id}/blacklist`);
  }

  // ========================================================================
  // Guarantors Endpoints
  // ========================================================================

  async getGuarantors(params?: GuarantorsQueryParams): Promise<SuccessResponse<Guarantor[]>> {
    return this.get('/guarantors', params);
  }

  async createGuarantor(data: CreateGuarantorRequest): Promise<SuccessResponse<Guarantor>> {
    return this.post('/guarantors', data);
  }

  async getGuarantor(id: string): Promise<SuccessResponse<Guarantor>> {
    return this.get(`/guarantors/${id}`);
  }

  async updateGuarantor(id: string, data: UpdateGuarantorRequest): Promise<SuccessResponse<Guarantor>> {
    return this.put(`/guarantors/${id}`, data);
  }

  async deleteGuarantor(id: string): Promise<void> {
    return this.delete(`/guarantors/${id}`);
  }

  async getGuarantorLoans(id: string): Promise<SuccessResponse<Loan[]>> {
    return this.get(`/guarantors/${id}/loans`);
  }

  // ========================================================================
  // Loans Endpoints
  // ========================================================================

  async getLoans(params?: LoansQueryParams): Promise<SuccessResponse<Loan[]>> {
    return this.get('/loans', params);
  }

  async createLoan(data: CreateLoanRequest): Promise<SuccessResponse<Loan>> {
    return this.post('/loans', data);
  }

  async getLoanByNumber(loanNumber: string): Promise<SuccessResponse<Loan>> {
    return this.get(`/loans/by-number/${loanNumber}`);
  }

  async getLoan(id: string): Promise<SuccessResponse<Loan>> {
    return this.get(`/loans/${id}`);
  }

  async getLoanSummary(id: string): Promise<SuccessResponse<Loan>> {
    return this.get(`/loans/${id}/summary`);
  }

  async getLoanTransactions(id: string): Promise<SuccessResponse<Transaction[]>> {
    return this.get(`/loans/${id}/transactions`);
  }

  async getLoanSchedule(id: string): Promise<SuccessResponse<unknown>> {
    return this.get(`/loans/${id}/schedule`);
  }

  async getLoanDailyCard(id: string): Promise<SuccessResponse<unknown>> {
    return this.get(`/loans/${id}/card`);
  }

  async disburseLoan(id: string): Promise<SuccessResponse<Loan>> {
    return this.post(`/loans/${id}/disburse`);
  }

  async updateLoanStatus(id: string, data: UpdateLoanStatusRequest): Promise<SuccessResponse<Loan>> {
    return this.put(`/loans/${id}/status`, data);
  }

  async collectDailyPayment(id: string, data: CollectDailyPaymentRequest): Promise<SuccessResponse<Transaction>> {
    return this.post(`/loans/${id}/collect-daily`, data);
  }

  async collectInterest(id: string, data: CollectInterestRequest): Promise<SuccessResponse<Transaction>> {
    return this.post(`/loans/${id}/collect-interest`, data);
  }

  async collectPrincipal(id: string, data: CollectPrincipalRequest): Promise<SuccessResponse<Transaction>> {
    return this.post(`/loans/${id}/collect-principal`, data);
  }

  async collectPenalty(id: string, data: CollectPenaltyRequest): Promise<SuccessResponse<Transaction>> {
    return this.post(`/loans/${id}/collect-penalty`, data);
  }

  async calculatePenalty(id: string): Promise<SuccessResponse<PenaltyCalculation>> {
    return this.post(`/loans/${id}/calculate-penalty`);
  }

  // ========================================================================
  // Collateral Endpoints
  // ========================================================================

  async getCollaterals(params?: CollateralQueryParams): Promise<SuccessResponse<Collateral[]>> {
    return this.get('/collateral', params);
  }

  async createCollateral(data: CreateCollateralRequest): Promise<SuccessResponse<Collateral>> {
    return this.post('/collateral', data);
  }

  async getCollateralsByLoan(loanId: string): Promise<SuccessResponse<Collateral[]>> {
    return this.get(`/collateral/loan/${loanId}`);
  }

  async getCollateral(id: string): Promise<SuccessResponse<Collateral>> {
    return this.get(`/collateral/${id}`);
  }

  async updateCollateral(id: string, data: UpdateCollateralRequest): Promise<SuccessResponse<Collateral>> {
    return this.put(`/collateral/${id}`, data);
  }

  async releaseCollateral(id: string, data?: ReleaseCollateralRequest): Promise<SuccessResponse<Collateral>> {
    return this.post(`/collateral/${id}/release`, data);
  }

  async seizeCollateral(id: string): Promise<SuccessResponse<Collateral>> {
    return this.post(`/collateral/${id}/seize`);
  }

  async sellCollateral(id: string): Promise<SuccessResponse<Collateral>> {
    return this.post(`/collateral/${id}/sell`);
  }

  // ========================================================================
  // Reports Endpoints
  // ========================================================================

  async getPortfolioSummary(): Promise<SuccessResponse<PortfolioSummary[]>> {
    return this.get('/reports/portfolio-summary');
  }

  async getDailyCollection(date?: string): Promise<SuccessResponse<DueCollection[]>> {
    return this.get('/reports/daily-collection', date ? { date } : undefined);
  }

  async getOverdueLoans(daysOverdue?: number): Promise<SuccessResponse<DueCollection[]>> {
    return this.get('/reports/overdue', daysOverdue !== undefined ? { daysOverdue } : undefined);
  }

  async getTypeADueToday(): Promise<SuccessResponse<Loan[]>> {
    return this.get('/reports/type-a-due-today');
  }

  async getTypeBEndingSoon(days?: number): Promise<SuccessResponse<Loan[]>> {
    return this.get('/reports/type-b-ending-soon', days !== undefined ? { days } : undefined);
  }

  async getProfitReport(params?: ProfitReportParams): Promise<SuccessResponse<unknown>> {
    return this.get('/reports/profit', params);
  }

  // ========================================================================
  // Health Endpoint
  // ========================================================================

  async getHealth(): Promise<SuccessResponse<HealthStatus>> {
    return this.get('/health');
  }
}

// ============================================================================
// Custom API Error Class
// ============================================================================

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
    public details?: ErrorDetail[]
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ============================================================================
// Export singleton instance
// ============================================================================

export const api = new ApiClient();

// Also export the class for custom instances
export { ApiClient };
