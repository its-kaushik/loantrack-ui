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
  CheckCircle2
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, Loan } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

export default function MonthlyLoans() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [collectType, setCollectType] = useState<'interest' | 'principal' | null>(null);
  const [amount, setAmount] = useState("");
  const [isCollecting, setIsCollecting] = useState(false);

  const fetchLoans = async () => {
    setIsLoading(true);
    try {
      // Fetch loans and filter for Type A (monthly) loans
      const response = await api.getLoans({ status: 'ACTIVE' });
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

  useEffect(() => {
    fetchLoans();
  }, []);

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
        <Button variant="outline" onClick={fetchLoans}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="metric-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Loans</p>
                <p className="text-2xl font-bold">{loans.length}</p>
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
                  {formatCurrency(loans.reduce((sum, l) => sum + l.outstandingPrincipal, 0))}
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
                  {loans.filter(l => isInterestDue(l)).length}
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
                      {isInterestDue(loan) ? (
                        <Badge variant="outline" className="status-overdue border-warning text-warning">
                          <Clock className="mr-1 h-3 w-3" />
                          Interest Due
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="status-active border-success text-success">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Current
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
    </div>
  );
}
