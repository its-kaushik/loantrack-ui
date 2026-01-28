import { useEffect, useState } from "react";
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
  CircleDashed
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
import { api, Loan, LoanStatus } from "@/lib/api";
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

  const fetchLoans = async () => {
    setIsLoading(true);
    try {
      // Fetch all loans (no status filter) and filter by type on client
      const response = await api.getLoans(statusFilter === 'ALL' ? {} : { status: statusFilter });
      if (response.success) {
        // Filter for monthly loans (Type A typically has termMonths)
        const monthlyLoans = response.data.filter(loan => loan.termMonths && loan.termMonths > 0);
        setLoans(monthlyLoans);
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const isInterestDue = (loan: Loan) => {
    // Simple check: if outstanding interest > 0, it's due
    return loan.outstandingInterest > 0;
  };

  const getMonthlyInterest = (loan: Loan) => {
    return (loan.principalAmount * loan.interestRate) / 100;
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
                  {formatCurrency(loans.filter(l => l.status === 'ACTIVE').reduce((sum, l) => sum + l.outstandingPrincipal, 0))}
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

      {/* Loans Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Monthly Loans</CardTitle>
          <CardDescription>
            Loans with monthly interest-only payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loans.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Loan #</TableHead>
                  <TableHead>Principal</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Monthly Interest</TableHead>
                  <TableHead>Outstanding</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loans.map((loan) => (
                  <TableRow key={loan.id}>
                    <TableCell>
                      <Link 
                        to={`/loans/${loan.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {loan.loanNumber}
                      </Link>
                    </TableCell>
                    <TableCell>{formatCurrency(loan.principalAmount)}</TableCell>
                    <TableCell>{loan.interestRate}%</TableCell>
                    <TableCell>{formatCurrency(getMonthlyInterest(loan))}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{formatCurrency(loan.outstandingPrincipal)}</p>
                        {loan.outstandingInterest > 0 && (
                          <p className="text-xs text-warning">
                            +{formatCurrency(loan.outstandingInterest)} interest
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(loan.status)}
                      {loan.status === 'ACTIVE' && isInterestDue(loan) && (
                        <Badge variant="outline" className="ml-2 border-warning text-warning">
                          <Clock className="mr-1 h-3 w-3" />
                          Interest Due
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {loan.status === 'PENDING' && (
                          <Button
                            size="sm"
                            onClick={() => setDisburseDialogLoan(loan)}
                          >
                            <Banknote className="mr-1 h-4 w-4" />
                            Disburse
                          </Button>
                        )}
                        {loan.status === 'ACTIVE' && (
                          <>
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
                          </>
                        )}
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
                Outstanding principal: {formatCurrency(selectedLoan.outstandingPrincipal)}
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
                  {formatCurrency(disburseDialogLoan?.principalAmount || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Interest Rate</span>
                <span className="font-medium">{disburseDialogLoan?.interestRate}% / month</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Term</span>
                <span className="font-medium">{disburseDialogLoan?.termMonths} months</span>
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
    </div>
  );
}
