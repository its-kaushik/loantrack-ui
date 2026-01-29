import { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  AlertCircle,
  IndianRupee,
  Loader2,
  RefreshCw,
  ChevronRight,
  Clock,
  CheckCircle2,
  Banknote,
  XCircle,
  CircleDashed,
  Plus,
  Search,
  X
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { api, Loan, LoanStatus, Borrower, CreateLoanRequest } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

export default function MonthlyLoans() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<LoanStatus | 'ALL'>('ALL');
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [collectType, setCollectType] = useState<'interest' | 'principal' | null>(null);
  const [amount, setAmount] = useState("");
  const [isCollecting, setIsCollecting] = useState(false);
  const [isDisbursing, setIsDisbursing] = useState(false);
  const [disburseDialogLoan, setDisburseDialogLoan] = useState<Loan | null>(null);

  // Create loan state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createForm, setCreateForm] = useState({
    principalAmount: "",
    interestRate: "5",
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
    setCreateForm({ principalAmount: "", interestRate: "5" });
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
    if (!principal || principal <= 0) {
      toast({ title: "Validation Error", description: "Principal amount must be greater than 0", variant: "destructive" });
      return;
    }

    setIsCreating(true);
    try {
      const payload: CreateLoanRequest = {
        borrowerId: selectedBorrower.id,
        loanTypeCode: "TYPE_A_MONTHLY",
        principalAmount: principal,
      };
      const rate = parseFloat(createForm.interestRate);
      if (rate && rate > 0) {
        payload.interestRate = rate / 100;
      }

      await api.createLoan(payload);
      toast({ title: "Loan Created", description: "Monthly loan has been created successfully" });
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
      const params: Record<string, string> = { loanTypeCode: 'TYPE_A_MONTHLY' };
      if (statusFilter !== 'ALL') params.status = statusFilter;
      const response = await api.getLoans(params as import("@/lib/api").LoansQueryParams);
      if (response.success) {
        setLoans(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch loans:', err);
      toast({
        title: "Error",
        description: "Failed to load monthly loans",
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
      await api.disburseLoan(disburseDialogLoan.id);
      toast({
        title: "Loan Disbursed",
        description: `${disburseDialogLoan.loanNumber} is now ACTIVE`,
      });
      setDisburseDialogLoan(null);
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

  const isInterestDue = (loan: Loan) => {
    return Number(loan.totalInterestAccrued || 0) - Number(loan.totalInterestPaid || 0) > 0;
  };

  const getOutstandingInterest = (loan: Loan) => {
    return Number(loan.totalInterestAccrued || 0) - Number(loan.totalInterestPaid || 0);
  };

  const getMonthlyInterest = (loan: Loan) => {
    return Number(loan.principalAmount) * Number(loan.interestRate);
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

  const handleCollect = async () => {
    if (!selectedLoan || !collectType || !amount) return;

    setIsCollecting(true);
    try {
      if (collectType === 'interest') {
        await api.collectInterest(selectedLoan.id, { amount: parseFloat(amount) });
        toast({
          title: "Interest Collected",
          description: `Successfully collected ${formatCurrency(parseFloat(amount))} interest`,
        });
      } else {
        await api.collectPrincipal(selectedLoan.id, { amount: parseFloat(amount) });
        toast({
          title: "Principal Collected",
          description: `Successfully collected ${formatCurrency(parseFloat(amount))} principal`,
        });
      }
      setSelectedLoan(null);
      setCollectType(null);
      setAmount("");
      fetchLoans();
    } catch (err) {
      toast({
        title: "Collection Failed",
        description: "Failed to record payment",
        variant: "destructive"
      });
    } finally {
      setIsCollecting(false);
    }
  };

  const openCollectionDialog = (loan: Loan, type: 'interest' | 'principal') => {
    setSelectedLoan(loan);
    setCollectType(type);
    setAmount(type === 'interest' ? getMonthlyInterest(loan).toString() : "");
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
            <Calendar className="h-6 w-6 text-primary" />
            Monthly Loans
          </h1>
          <p className="text-muted-foreground">Type A loans with monthly interest payments</p>
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

      {/* Summary Cards */}
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
                <p className="text-sm text-muted-foreground">Active Loans</p>
                <p className="text-2xl font-bold">
                  {loans.filter(l => l.status === 'ACTIVE').length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Outstanding</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(loans.filter(l => l.status === 'ACTIVE').reduce((sum, l) => sum + Number(l.currentPrincipal), 0))}
                </p>
              </div>
              <IndianRupee className="h-8 w-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card border-warning/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Interest Due</p>
                <p className="text-2xl font-bold text-warning">
                  {loans.filter(l => l.status === 'ACTIVE' && isInterestDue(l)).length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-warning/20" />
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
                        {formatCurrency(Number(loan.principalAmount))} • {(Number(loan.interestRate) * 100).toFixed(0)}% / month
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

      {/* Active Loans Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Monthly Loans</CardTitle>
          <CardDescription>
            Loans with monthly interest-only payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loans.filter(l => l.status === 'ACTIVE').length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Loan #</TableHead>
                  <TableHead>Borrower</TableHead>
                  <TableHead>Principal</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Monthly Interest</TableHead>
                  <TableHead>Outstanding</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loans.filter(l => l.status === 'ACTIVE').map((loan) => (
                  <TableRow key={loan.id}>
                    <TableCell>
                      <Link
                        to={`/loans/${loan.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {loan.loanNumber}
                      </Link>
                    </TableCell>
                    <TableCell>{loan.borrower?.fullName || '-'}</TableCell>
                    <TableCell>{formatCurrency(Number(loan.principalAmount))}</TableCell>
                    <TableCell>{(Number(loan.interestRate) * 100).toFixed(0)}%</TableCell>
                    <TableCell>{formatCurrency(getMonthlyInterest(loan))}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{formatCurrency(Number(loan.currentPrincipal))}</p>
                        {getOutstandingInterest(loan) > 0 && (
                          <p className="text-xs text-warning">
                            +{formatCurrency(getOutstandingInterest(loan))} interest
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(loan.status)}
                      {isInterestDue(loan) && (
                        <Badge variant="outline" className="ml-2 border-warning text-warning">
                          <Clock className="mr-1 h-3 w-3" />
                          Interest Due
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openCollectionDialog(loan, 'interest')}
                        >
                          Collect Interest
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openCollectionDialog(loan, 'principal')}
                        >
                          Return Principal
                        </Button>
                        <Link to={`/loans/${loan.id}`}>
                          <Button size="sm" variant="ghost">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No active monthly loans found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Closed & Defaulted Loans Section */}
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
                        {formatCurrency(Number(loan.principalAmount))}
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

      {/* Collection Dialog */}
      <Dialog open={!!selectedLoan && !!collectType} onOpenChange={() => {
        setSelectedLoan(null);
        setCollectType(null);
        setAmount("");
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {collectType === 'interest' ? 'Collect Interest' : 'Collect Principal'}
            </DialogTitle>
            <DialogDescription>
              {selectedLoan?.loanNumber} - Record {collectType} payment
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Amount (₹)</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>

            {collectType === 'interest' && selectedLoan && (
              <p className="text-sm text-muted-foreground">
                Monthly interest: {formatCurrency(getMonthlyInterest(selectedLoan))}
              </p>
            )}

            {collectType === 'principal' && selectedLoan && (
              <p className="text-sm text-muted-foreground">
                Outstanding principal: {formatCurrency(Number(selectedLoan.currentPrincipal))}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setSelectedLoan(null);
              setCollectType(null);
              setAmount("");
            }}>
              Cancel
            </Button>
            <Button onClick={handleCollect} disabled={isCollecting || !amount}>
              {isCollecting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Confirm Collection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disburse Confirmation Dialog */}
      <Dialog open={!!disburseDialogLoan} onOpenChange={() => setDisburseDialogLoan(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disburse Loan</DialogTitle>
            <DialogDescription>
              Confirm disbursement of {disburseDialogLoan?.loanNumber}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="bg-muted rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Principal Amount</span>
                <span className="font-medium">
                  {formatCurrency(Number(disburseDialogLoan?.principalAmount) || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Interest Rate</span>
                <span className="font-medium">{((Number(disburseDialogLoan?.interestRate) || 0) * 100).toFixed(0)}% / month</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              This will mark the loan as <strong>ACTIVE</strong> and start the repayment schedule.
              First month's interest will be deducted in advance.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDisburseDialogLoan(null)}>
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
            <DialogTitle>Create Monthly Loan</DialogTitle>
            <DialogDescription>
              Create a new Type A monthly interest loan (open-ended term)
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
              <Label>Interest Rate (% per month)</Label>
              <Input
                type="number"
                placeholder="e.g. 5"
                value={createForm.interestRate}
                onChange={(e) => setCreateForm({ ...createForm, interestRate: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Defaults to 5% per month if left empty</p>
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
