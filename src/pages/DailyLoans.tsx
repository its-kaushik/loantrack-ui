import { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  AlertCircle,
  Loader2,
  RefreshCw,
  ChevronRight,
  Check,
  X,
  Clock,
  Banknote,
  CheckCircle2,
  XCircle,
  CircleDashed,
  Plus,
  Search
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { api, Loan, LoanStatus, Borrower, CreateLoanRequest } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface DailyLoanCard {
  loan: Loan;
  filledBoxes: number;
  totalBoxes: number;
  isLateToday: boolean;
  penaltyMonths: number;
  dailyAmount: number;
}

export default function DailyLoans() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loanCards, setLoanCards] = useState<DailyLoanCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<LoanStatus | 'ALL'>('ALL');
  const [selectedLoan, setSelectedLoan] = useState<DailyLoanCard | null>(null);
  const [collectAmount, setCollectAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [isCollecting, setIsCollecting] = useState(false);
  const [isDisbursing, setIsDisbursing] = useState(false);
  const [disburseDialogLoan, setDisburseDialogLoan] = useState<Loan | null>(null);
  const [disburseDate, setDisburseDate] = useState("");

  // Create loan state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createForm, setCreateForm] = useState({
    principalAmount: "",
    interestRate: "5",
    termDays: "120",
  });
  const [isCreating, setIsCreating] = useState(false);
  const [borrowerSearch, setBorrowerSearch] = useState("");
  const [borrowerResults, setBorrowerResults] = useState<Borrower[]>([]);
  const [selectedBorrower, setSelectedBorrower] = useState<Borrower | null>(null);
  const [showBorrowerDropdown, setShowBorrowerDropdown] = useState(false);
  const borrowerSearchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchBorrowers = useCallback(async (query: string) => {
    if (query.length < 2) {
      setBorrowerResults([]);
      setShowBorrowerDropdown(false);
      return;
    }
    try {
      const response = await api.getBorrowers({ search: query, limit: 10 });
      if (response.success) {
        setBorrowerResults(response.data);
        setShowBorrowerDropdown(response.data.length > 0);
      }
    } catch {
      setBorrowerResults([]);
    }
  }, []);

  const handleBorrowerSearchChange = (value: string) => {
    setBorrowerSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchBorrowers(value), 300);
  };

  const selectBorrower = (borrower: Borrower) => {
    setSelectedBorrower(borrower);
    setBorrowerSearch("");
    setBorrowerResults([]);
    setShowBorrowerDropdown(false);
  };

  const clearSelectedBorrower = () => {
    setSelectedBorrower(null);
    setBorrowerSearch("");
  };

  const resetCreateForm = () => {
    setCreateForm({ principalAmount: "", interestRate: "5", termDays: "120" });
    setSelectedBorrower(null);
    setBorrowerSearch("");
    setBorrowerResults([]);
    setShowBorrowerDropdown(false);
  };

  const handleCreateLoan = async () => {
    if (!selectedBorrower) {
      toast({ title: "Validation Error", description: "Please select a borrower", variant: "destructive" });
      return;
    }
    const principal = parseFloat(createForm.principalAmount);
    const rate = parseFloat(createForm.interestRate);
    const term = parseInt(createForm.termDays);
    if (!principal || principal <= 0) {
      toast({ title: "Validation Error", description: "Principal amount must be greater than 0", variant: "destructive" });
      return;
    }
    if (!rate || rate <= 0) {
      toast({ title: "Validation Error", description: "Interest rate must be greater than 0", variant: "destructive" });
      return;
    }
    if (!term || term <= 0) {
      toast({ title: "Validation Error", description: "Term in days must be greater than 0", variant: "destructive" });
      return;
    }

    setIsCreating(true);
    try {
      const payload: CreateLoanRequest = {
        borrowerId: selectedBorrower.id,
        loanTypeCode: "TYPE_B_DAILY",
        principalAmount: principal,
        interestRate: rate / 100,
        termDays: term,
      };

      await api.createLoan(payload);
      toast({ title: "Loan Created", description: "Daily loan has been created successfully" });
      setShowCreateDialog(false);
      resetCreateForm();
      fetchLoans();
    } catch {
      toast({ title: "Error", description: "Failed to create loan", variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  const fetchLoans = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = { loanTypeCode: 'TYPE_B_DAILY' };
      if (statusFilter !== 'ALL') params.status = statusFilter;
      const response = await api.getLoans(params as import("@/lib/api").LoansQueryParams);
      if (response.success) {
        const dailyLoans = response.data;
        setLoans(dailyLoans);

        // Calculate card data for ACTIVE loans only
        const activeLoans = dailyLoans.filter(loan => loan.status === 'ACTIVE');
        const cards: DailyLoanCard[] = activeLoans.map(loan => {
          const totalBoxes = loan.termDays || 100;
          const loanStartDate = new Date(loan.disbursementDate || loan.applicationDate || loan.createdAt);
          const today = new Date();
          const daysSinceStart = Math.floor((today.getTime() - loanStartDate.getTime()) / (1000 * 60 * 60 * 24));

          // Parse numeric values (API returns decimal strings)
          const principalAmount = Number(loan.principalAmount) || 0;
          const totalExpectedRepayment = Number(loan.totalExpectedRepayment) || principalAmount;
          const totalPrincipalPaid = Number(loan.totalPrincipalPaid) || 0;
          const totalInterestPaid = Number(loan.totalInterestPaid) || 0;
          const dailyInstallmentAmount = Number(loan.dailyInstallmentAmount) || 0;

          // Calculate daily amount - use dailyInstallmentAmount if valid, otherwise calculate from total
          const dailyAmount = dailyInstallmentAmount > 0
            ? dailyInstallmentAmount
            : totalExpectedRepayment > 0
              ? totalExpectedRepayment / totalBoxes
              : principalAmount / totalBoxes;

          // Calculate filled boxes based on payments made
          const totalPaid = totalPrincipalPaid + totalInterestPaid;
          const filledBoxes = dailyAmount > 0 ? Math.floor(totalPaid / dailyAmount) : 0;

          // Check if late today (expected boxes > filled boxes)
          const expectedBoxes = Math.min(Math.max(0, daysSinceStart + 1), totalBoxes);
          const isLateToday = filledBoxes < expectedBoxes;

          // Calculate penalty months (if exceeded term)
          const daysOverdue = Math.max(0, daysSinceStart - totalBoxes);
          const penaltyMonths = daysOverdue > 0 ? Math.ceil(daysOverdue / 30) : 0;

          return {
            loan,
            filledBoxes: Math.min(Math.max(0, filledBoxes), totalBoxes),
            totalBoxes,
            isLateToday,
            penaltyMonths,
            dailyAmount // Store for display
          };
        });

        setLoanCards(cards);
      }
    } catch (err) {
      console.error('Failed to fetch loans:', err);
      toast({
        title: "Error",
        description: "Failed to load daily loans",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisburse = async () => {
    if (!disburseDialogLoan) return;
    setIsDisbursing(true);
    try {
      const body = disburseDate ? { disbursementDate: disburseDate } : undefined;
      await api.disburseLoan(disburseDialogLoan.id, body);
      toast({
        title: "Loan Disbursed",
        description: `${disburseDialogLoan.loanNumber} is now ACTIVE`,
      });
      setDisburseDialogLoan(null);
      setDisburseDate("");
      fetchLoans();
    } catch (err) {
      toast({
        title: "Disbursement Failed",
        description: "Failed to disburse loan",
        variant: "destructive"
      });
    } finally {
      setIsDisbursing(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, [statusFilter]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: LoanStatus) => {
    switch (status) {
      case 'PENDING':
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-500">
            <CircleDashed className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      case 'ACTIVE':
        return (
          <Badge variant="outline" className="border-success text-success">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Active
          </Badge>
        );
      case 'CLOSED':
        return (
          <Badge variant="outline" className="border-muted-foreground text-muted-foreground">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Closed
          </Badge>
        );
      case 'DEFAULTED':
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            Defaulted
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const openCollectDialog = (card: DailyLoanCard) => {
    setSelectedLoan(card);
    setCollectAmount(card.dailyAmount.toString());
    setPaymentMethod("CASH");
  };

  const handleCollectDaily = async () => {
    if (!selectedLoan) return;
    const amount = parseFloat(collectAmount);
    if (!amount || amount <= 0) {
      toast({ title: "Validation Error", description: "Amount must be greater than 0", variant: "destructive" });
      return;
    }

    setIsCollecting(true);
    try {
      const response = await api.collectDailyPayment(selectedLoan.loan.id, { amount, paymentMethod });
      const daysCount = response.data?.daysMarked?.length || 1;
      toast({
        title: "Payment Collected",
        description: `${formatCurrency(amount)} collected — ${daysCount} day${daysCount > 1 ? 's' : ''} marked for ${selectedLoan.loan.loanNumber}`,
      });
      setSelectedLoan(null);
      setCollectAmount("");
      fetchLoans();
    } catch (err) {
      toast({
        title: "Collection Failed",
        description: "Failed to record daily payment",
        variant: "destructive"
      });
    } finally {
      setIsCollecting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-accent" />
            Daily Loans
          </h1>
          <p className="text-muted-foreground">Type B loans with daily collection cards</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as LoanStatus | 'ALL')}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
              <SelectItem value="DEFAULTED">Defaulted</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchLoans}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Loan
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="metric-card border-blue-500/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-blue-500">
                  {loans.filter(l => l.status === 'PENDING').length}
                </p>
              </div>
              <CircleDashed className="h-8 w-8 text-blue-500/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Cards</p>
                <p className="text-2xl font-bold">{loanCards.length}</p>
              </div>
              <CalendarDays className="h-8 w-8 text-accent/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card border-warning/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Late Today</p>
                <p className="text-2xl font-bold text-warning">
                  {loanCards.filter(c => c.isLateToday).length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-warning/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card border-destructive/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">With Penalties</p>
                <p className="text-2xl font-bold text-destructive">
                  {loanCards.filter(c => c.penaltyMonths > 0).length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-destructive/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Loans Section */}
      {loans.filter(l => l.status === 'PENDING').length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pending Disbursement</CardTitle>
            <CardDescription>Loans awaiting disbursement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {loans.filter(l => l.status === 'PENDING').map((loan) => (
                <div
                  key={loan.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-muted/30"
                >
                  <div className="flex items-center gap-4">
                    {getStatusBadge(loan.status)}
                    <div>
                      <Link
                        to={`/loans/${loan.id}`}
                        className="font-medium hover:text-primary hover:underline"
                      >
                        {loan.loanNumber}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {loan.borrower?.fullName && <>{loan.borrower.fullName} • </>}
                        {formatCurrency(loan.principalAmount)} • {loan.termDays} days
                      </p>
                    </div>
                  </div>
                  <Button onClick={() => setDisburseDialogLoan(loan)}>
                    <Banknote className="mr-2 h-4 w-4" />
                    Disburse
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Closed/Defaulted Loans Section */}
      {loans.filter(l => l.status === 'CLOSED' || l.status === 'DEFAULTED').length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Closed & Defaulted Loans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {loans.filter(l => l.status === 'CLOSED' || l.status === 'DEFAULTED').map((loan) => (
                <div
                  key={loan.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-muted/30"
                >
                  <div className="flex items-center gap-4">
                    {getStatusBadge(loan.status)}
                    <div>
                      <Link
                        to={`/loans/${loan.id}`}
                        className="font-medium hover:text-primary hover:underline"
                      >
                        {loan.loanNumber}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {loan.borrower?.fullName && <>{loan.borrower.fullName} • </>}
                        {formatCurrency(loan.principalAmount)}
                      </p>
                    </div>
                  </div>
                  <Link to={`/loans/${loan.id}`}>
                    <Button variant="ghost" size="sm">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Loan Cards Grid */}
      {loanCards.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Active Collection Cards</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {loanCards.map((card) => (
              <Card
                key={card.loan.id}
                className={`transition-all hover:shadow-md ${
                  card.penaltyMonths > 0
                    ? 'border-destructive/50'
                    : card.isLateToday
                      ? 'border-warning/50'
                      : ''
                }`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">
                        <Link
                          to={`/loans/${card.loan.id}`}
                          className="hover:text-primary hover:underline"
                        >
                          {card.loan.loanNumber}
                        </Link>
                      </CardTitle>
                      <CardDescription>
                        {card.loan.borrower?.fullName && <>{card.loan.borrower.fullName} • </>}
                        {formatCurrency(card.dailyAmount)}/day
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {card.penaltyMonths > 0 && (
                        <Badge variant="destructive">
                          +{card.penaltyMonths} penalty
                        </Badge>
                      )}
                      {card.isLateToday && card.penaltyMonths === 0 && (
                        <Badge variant="outline" className="border-warning text-warning">
                          Late
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{card.filledBoxes}/{card.totalBoxes}</span>
                    </div>
                    <Progress
                      value={(card.filledBoxes / card.totalBoxes) * 100}
                      className="h-2"
                    />
                  </div>

                  {/* Mini Box Grid (showing first 20 boxes as preview) */}
                  <div className="grid grid-cols-10 gap-1">
                    {Array.from({ length: Math.min(20, card.totalBoxes) }).map((_, idx) => (
                      <div
                        key={idx}
                        className={`daily-box ${
                          idx < card.filledBoxes
                            ? 'daily-box-filled'
                            : idx === card.filledBoxes && card.isLateToday
                              ? 'daily-box-missed'
                              : idx === card.filledBoxes
                                ? 'daily-box-today'
                                : ''
                        }`}
                      >
                        {idx < card.filledBoxes && (
                          <Check className="h-3 w-3 text-success-foreground" />
                        )}
                        {idx >= card.filledBoxes && idx < card.filledBoxes + 1 && card.isLateToday && (
                          <X className="h-3 w-3 text-destructive" />
                        )}
                      </div>
                    ))}
                    {card.totalBoxes > 20 && (
                      <div className="col-span-10 text-xs text-muted-foreground text-center mt-1">
                        +{card.totalBoxes - 20} more boxes
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => openCollectDialog(card)}
                      disabled={card.filledBoxes >= card.totalBoxes}
                    >
                      Collect Payment
                    </Button>
                    <Link to={`/loans/${card.loan.id}`}>
                      <Button size="sm" variant="outline">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {loans.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>No daily loans found</p>
          </CardContent>
        </Card>
      )}

      {/* Collect Payment Dialog */}
      <Dialog open={!!selectedLoan} onOpenChange={() => { setSelectedLoan(null); setCollectAmount(""); setPaymentMethod("CASH"); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Collect Daily Payment</DialogTitle>
            <DialogDescription>
              {selectedLoan?.loan.loanNumber}
              {selectedLoan?.loan.borrower?.fullName && ` — ${selectedLoan.loan.borrower.fullName}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-muted rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Daily Installment</span>
                <span className="font-medium">{formatCurrency(selectedLoan?.dailyAmount || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{selectedLoan?.filledBoxes}/{selectedLoan?.totalBoxes} days</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Amount (₹)</Label>
              <Input
                type="number"
                value={collectAmount}
                onChange={(e) => setCollectAmount(e.target.value)}
                placeholder="Enter amount"
              />
              <p className="text-xs text-muted-foreground">
                Enter the daily installment for 1 day, or a larger amount to cover multiple days
              </p>
            </div>

            <div className="space-y-2">
              <Label>Payment Method</Label>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="flex gap-4">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="CASH" id="pm-cash" />
                  <Label htmlFor="pm-cash" className="font-normal cursor-pointer">Cash</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="UPI" id="pm-upi" />
                  <Label htmlFor="pm-upi" className="font-normal cursor-pointer">UPI</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="BANK_TRANSFER" id="pm-bank" />
                  <Label htmlFor="pm-bank" className="font-normal cursor-pointer">Bank Transfer</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setSelectedLoan(null); setCollectAmount(""); setPaymentMethod("CASH"); }}>
              Cancel
            </Button>
            <Button onClick={handleCollectDaily} disabled={isCollecting || !collectAmount}>
              {isCollecting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              Collect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disburse Confirmation Dialog */}
      <Dialog open={!!disburseDialogLoan} onOpenChange={() => { setDisburseDialogLoan(null); setDisburseDate(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disburse Loan</DialogTitle>
            <DialogDescription>
              Confirm disbursement of {disburseDialogLoan?.loanNumber}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-muted rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Principal Amount</span>
                <span className="font-medium">
                  {formatCurrency(disburseDialogLoan?.principalAmount || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Interest Rate</span>
                <span className="font-medium">{((disburseDialogLoan?.interestRate || 0) * 100).toFixed(0)}% / month</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Term</span>
                <span className="font-medium">{disburseDialogLoan?.termDays} days</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Disbursement Date</Label>
              <Input
                type="date"
                value={disburseDate}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => setDisburseDate(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to use today's date. Set a past date for onboarding existing loans.
              </p>
            </div>

            <p className="text-sm text-muted-foreground">
              This will mark the loan as <strong>ACTIVE</strong> and create the daily payment card
              with {disburseDialogLoan?.termDays} boxes.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setDisburseDialogLoan(null); setDisburseDate(""); }}>
              Cancel
            </Button>
            <Button onClick={handleDisburse} disabled={isDisbursing}>
              {isDisbursing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Banknote className="mr-2 h-4 w-4" />
              )}
              Confirm Disbursement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Loan Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={(open) => {
        setShowCreateDialog(open);
        if (!open) resetCreateForm();
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Daily Loan</DialogTitle>
            <DialogDescription>
              Create a new Type B daily collection loan
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Borrower Search */}
            <div className="space-y-2">
              <Label>Borrower *</Label>
              {selectedBorrower ? (
                <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
                  <span className="flex-1 text-sm font-medium">{selectedBorrower.fullName}</span>
                  <span className="text-xs text-muted-foreground">{selectedBorrower.phone}</span>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={clearSelectedBorrower}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="relative" ref={borrowerSearchRef}>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search borrower by name or phone..."
                      value={borrowerSearch}
                      onChange={(e) => handleBorrowerSearchChange(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  {showBorrowerDropdown && borrowerResults.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-48 overflow-y-auto">
                      {borrowerResults.map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          className="w-full text-left px-3 py-2 hover:bg-accent text-sm flex justify-between items-center"
                          onClick={() => selectBorrower(b)}
                        >
                          <span className="font-medium">{b.fullName}</span>
                          <span className="text-muted-foreground text-xs">{b.phone}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Principal Amount */}
            <div className="space-y-2">
              <Label>Principal Amount (₹) *</Label>
              <Input
                type="number"
                placeholder="e.g. 100000"
                value={createForm.principalAmount}
                onChange={(e) => setCreateForm({ ...createForm, principalAmount: e.target.value })}
              />
            </div>

            {/* Interest Rate */}
            <div className="space-y-2">
              <Label>Interest Rate (% per month) *</Label>
              <Input
                type="number"
                placeholder="e.g. 5"
                value={createForm.interestRate}
                onChange={(e) => setCreateForm({ ...createForm, interestRate: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Enter as whole number, e.g. 5 for 5% per month</p>
            </div>

            {/* Term in Days */}
            <div className="space-y-2">
              <Label>Term in Days *</Label>
              <Input
                type="number"
                placeholder="e.g. 100"
                value={createForm.termDays}
                onChange={(e) => setCreateForm({ ...createForm, termDays: e.target.value })}
              />
            </div>

          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCreateDialog(false); resetCreateForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleCreateLoan} disabled={isCreating}>
              {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Loan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
