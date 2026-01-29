import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  ArrowLeft,
  Calendar,
  CalendarDays,
  User,
  Shield,
  FileText,
  IndianRupee,
  Clock,
  AlertTriangle,
  Loader2,
  Phone,
  MapPin,
  Check,
  Image as ImageIcon
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { api, Loan, Guarantor, Collateral, Transaction, Borrower } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

export default function LoanDetail() {
  const { id } = useParams<{ id: string }>();
  const [loan, setLoan] = useState<Loan | null>(null);
  const [borrower, setBorrower] = useState<Borrower | null>(null);
  const [guarantors, setGuarantors] = useState<Guarantor[]>([]);
  const [collaterals, setCollaterals] = useState<Collateral[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchLoanDetails();
  }, [id]);

  const fetchLoanDetails = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      const [loanRes, transactionsRes, collateralsRes] = await Promise.all([
        api.getLoan(id),
        api.getLoanTransactions(id),
        api.getCollateralsByLoan(id)
      ]);

      if (loanRes.success) {
        setLoan(loanRes.data);
        
        // Fetch borrower details
        const borrowerId = loanRes.data.borrower?.id;
        if (borrowerId) {
          const borrowerRes = await api.getBorrower(borrowerId);
          if (borrowerRes.success) {
            setBorrower(borrowerRes.data);

            // Fetch guarantors for this borrower
            const guarantorsRes = await api.getGuarantors({ borrowerId });
            if (guarantorsRes.success) {
              setGuarantors(guarantorsRes.data);
            }
          }
        }
      }

      if (transactionsRes.success) {
        setTransactions(transactionsRes.data);
      }

      if (collateralsRes.success) {
        setCollaterals(collateralsRes.data);
      }
    } catch (err) {
      console.error('Failed to fetch loan details:', err);
      toast({
        title: "Error",
        description: "Failed to load loan details",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="status-active">Active</Badge>;
      case 'PENDING':
        return <Badge className="status-pending">Pending</Badge>;
      case 'CLOSED':
        return <Badge className="status-closed">Closed</Badge>;
      case 'DEFAULTED':
        return <Badge className="status-defaulted">Defaulted</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const isMonthlyLoan = loan?.loanType?.code === 'TYPE_A_MONTHLY';
  const isDailyLoan = loan?.loanType?.code === 'TYPE_B_DAILY';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Loan Not Found</h3>
            <p className="text-muted-foreground mb-4">The loan you're looking for doesn't exist.</p>
            <Link to="/dashboard">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link to={isMonthlyLoan ? "/loans/monthly" : "/loans/daily"}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{loan.loanNumber}</h1>
              {getStatusBadge(loan.status)}
            </div>
            <p className="text-muted-foreground flex items-center gap-2 mt-1">
              {isMonthlyLoan ? (
                <>
                  <Calendar className="h-4 w-4" />
                  Monthly Loan (Open-ended)
                </>
              ) : (
                <>
                  <CalendarDays className="h-4 w-4" />
                  Daily Loan • {loan.termDays} days
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Loan Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Financial Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Principal Amount</p>
                  <p className="text-xl font-bold">{formatCurrency(loan.principalAmount)}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Interest Rate</p>
                  <p className="text-xl font-bold">{(Number(loan.interestRate) * 100).toFixed(0)}% / month</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Total Expected</p>
                  <p className="text-xl font-bold">{formatCurrency(Number(loan.totalExpectedRepayment || 0))}</p>
                </div>
                <div className="p-4 rounded-lg bg-primary/10">
                  <p className="text-sm text-muted-foreground">Outstanding Principal</p>
                  <p className="text-xl font-bold text-primary">{formatCurrency(Number(loan.currentPrincipal))}</p>
                </div>
                <div className="p-4 rounded-lg bg-warning/10">
                  <p className="text-sm text-muted-foreground">Outstanding Interest</p>
                  <p className="text-xl font-bold text-warning">{formatCurrency(Number(loan.totalInterestAccrued || 0) - Number(loan.totalInterestPaid || 0))}</p>
                </div>
                <div className="p-4 rounded-lg bg-success/10">
                  <p className="text-sm text-muted-foreground">Total Paid</p>
                  <p className="text-xl font-bold text-success">
                    {formatCurrency(Number(loan.totalPrincipalPaid) + Number(loan.totalInterestPaid))}
                  </p>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Repayment Progress</span>
                  <span className="font-medium">
                    {Number(loan.totalExpectedRepayment) > 0
                      ? Math.round(((Number(loan.totalPrincipalPaid) + Number(loan.totalInterestPaid)) / Number(loan.totalExpectedRepayment)) * 100)
                      : 0}%
                  </span>
                </div>
                <Progress
                  value={Number(loan.totalExpectedRepayment) > 0
                    ? ((Number(loan.totalPrincipalPaid) + Number(loan.totalInterestPaid)) / Number(loan.totalExpectedRepayment)) * 100
                    : 0}
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Daily Card Grid (for daily loans) */}
          {isDailyLoan && (
            <Card>
              <CardHeader>
                <CardTitle>Daily Card</CardTitle>
                <CardDescription>Payment collection grid</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-10 gap-1.5">
                  {Array.from({ length: loan.termDays || 100 }).map((_, idx) => {
                    const dailyAmount = Number(loan.dailyInstallmentAmount) || (Number(loan.totalExpectedRepayment || 0) / (loan.termDays || 100));
                    const totalPaid = Number(loan.totalPrincipalPaid) + Number(loan.totalInterestPaid);
                    const filledBoxes = Math.floor(totalPaid / dailyAmount);
                    const isFilled = idx < filledBoxes;
                    
                    return (
                      <div
                        key={idx}
                        className={`daily-box flex items-center justify-center ${
                          isFilled ? 'daily-box-filled' : ''
                        }`}
                        title={`Day ${idx + 1}`}
                      >
                        {isFilled && <Check className="h-3 w-3 text-success-foreground" />}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length > 0 ? (
                <div className="space-y-3">
                  {transactions.map((txn) => (
                    <div key={txn.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          txn.type === 'PRINCIPAL' ? 'bg-primary/10' :
                          txn.type === 'INTEREST' ? 'bg-success/10' :
                          txn.type === 'PENALTY' ? 'bg-destructive/10' :
                          'bg-accent/10'
                        }`}>
                          <IndianRupee className={`h-5 w-5 ${
                            txn.type === 'PRINCIPAL' ? 'text-primary' :
                            txn.type === 'INTEREST' ? 'text-success' :
                            txn.type === 'PENALTY' ? 'text-destructive' :
                            'text-accent'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium capitalize">{txn.type.toLowerCase().replace('_', ' ')}</p>
                          <p className="text-sm text-muted-foreground">{formatDate(txn.paymentDate)}</p>
                        </div>
                      </div>
                      <p className="font-semibold text-success">+{formatCurrency(txn.amount)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">No transactions recorded yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Borrower, Guarantor, Collateral */}
        <div className="space-y-6">
          {/* Borrower Info */}
          {borrower && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Borrower
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-lg font-semibold">{borrower.fullName}</p>
                  {borrower.occupation && (
                    <p className="text-sm text-muted-foreground">{borrower.occupation}</p>
                  )}
                </div>
                <Separator />
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {borrower.phone}
                  </div>
                  {borrower.altPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {borrower.altPhone}
                    </div>
                  )}
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span>{borrower.address}, {borrower.city}</span>
                  </div>
                </div>
                {borrower.isBlacklisted && (
                  <Badge variant="destructive" className="w-full justify-center">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Blacklisted
                  </Badge>
                )}
              </CardContent>
            </Card>
          )}

          {/* Guarantors */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Guarantors
              </CardTitle>
            </CardHeader>
            <CardContent>
              {guarantors.length > 0 ? (
                <div className="space-y-4">
                  {guarantors.map((guarantor) => (
                    <div key={guarantor.id} className="p-3 rounded-lg bg-muted/50 space-y-2">
                      <div className="flex justify-between">
                        <p className="font-medium">{guarantor.fullName}</p>
                        <Badge variant="outline" className="text-xs">{guarantor.relationship}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {guarantor.phone}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-muted-foreground">No guarantors linked</p>
              )}
            </CardContent>
          </Card>

          {/* Collateral */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Collateral
              </CardTitle>
            </CardHeader>
            <CardContent>
              {collaterals.length > 0 ? (
                <div className="space-y-4">
                  {collaterals.map((collateral) => (
                    <div key={collateral.id} className="p-3 rounded-lg bg-muted/50 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{collateral.itemType}</p>
                          <p className="text-sm text-muted-foreground">{collateral.description}</p>
                        </div>
                        <Badge variant={
                          collateral.status === 'HELD' ? 'default' :
                          collateral.status === 'RELEASED' ? 'secondary' :
                          'destructive'
                        }>
                          {collateral.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Estimated Value</span>
                        <span className="font-medium">{formatCurrency(collateral.estimatedValue)}</span>
                      </div>
                      {collateral.photoUrls && collateral.photoUrls.length > 0 && (
                        <div className="flex gap-2">
                          {collateral.photoUrls.slice(0, 3).map((url, idx) => (
                            <div key={idx} className="h-16 w-16 rounded bg-muted flex items-center justify-center overflow-hidden">
                              <img src={url} alt="Collateral" className="h-full w-full object-cover" />
                            </div>
                          ))}
                          {collateral.photoUrls.length > 3 && (
                            <div className="h-16 w-16 rounded bg-muted flex items-center justify-center text-sm text-muted-foreground">
                              +{collateral.photoUrls.length - 3}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-muted-foreground">No collateral registered</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
