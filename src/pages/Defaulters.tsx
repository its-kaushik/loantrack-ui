import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  AlertTriangle, 
  Loader2, 
  RefreshCw,
  Phone,
  MapPin,
  ChevronRight,
  Clock,
  IndianRupee,
  Search
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { api, Loan } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface DefaulterInfo {
  loan: Loan;
  borrowerName?: string;
  borrowerPhone?: string;
  daysOverdue: number;
  outstandingTotal: number;
}

export default function Defaulters() {
  const [defaulters, setDefaulters] = useState<DefaulterInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchDefaulters = async () => {
    setIsLoading(true);
    try {
      const response = await api.getLoans({ status: 'DEFAULTED' });
      if (response.success) {
        // Calculate additional info for each defaulted loan
        const defaulterInfos: DefaulterInfo[] = await Promise.all(
          response.data.map(async (loan) => {
            let borrowerName = undefined;
            let borrowerPhone = undefined;
            
            // Use nested borrower if available, otherwise fetch
            if (loan.borrower) {
              borrowerName = loan.borrower.fullName;
              borrowerPhone = loan.borrower.phone;
            } else {
              try {
                const borrowerId = (loan as any).borrowerId;
                if (borrowerId) {
                  const borrowerRes = await api.getBorrower(borrowerId);
                  if (borrowerRes.success) {
                    borrowerName = borrowerRes.data.fullName;
                    borrowerPhone = borrowerRes.data.phone;
                  }
                }
              } catch {
                // Ignore borrower fetch errors
              }
            }

            let daysOverdue = Number(loan.daysPastDue || 0);
            if (!daysOverdue && loan.maturityDate) {
              const maturityDate = new Date(loan.maturityDate);
              const today = new Date();
              daysOverdue = Math.max(0, Math.floor((today.getTime() - maturityDate.getTime()) / (1000 * 60 * 60 * 24)));
            }

            const outstandingInterest = Number(loan.totalInterestAccrued || 0) - Number(loan.totalInterestPaid || 0);

            return {
              loan,
              borrowerName,
              borrowerPhone,
              daysOverdue,
              outstandingTotal: Number(loan.currentPrincipal) + outstandingInterest
            };
          })
        );

        setDefaulters(defaulterInfos);
      }
    } catch (err) {
      console.error('Failed to fetch defaulters:', err);
      toast({
        title: "Error",
        description: "Failed to load defaulters",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDefaulters();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const calculatePenaltyMonths = (daysOverdue: number) => {
    return Math.ceil(daysOverdue / 30);
  };

  const filteredDefaulters = defaulters.filter(d => 
    !searchQuery || 
    d.borrowerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.loan.loanNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.borrowerPhone?.includes(searchQuery)
  );

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
            <AlertTriangle className="h-6 w-6 text-destructive" />
            Defaulters
          </h1>
          <p className="text-muted-foreground">Run-away tracker - borrowers who have defaulted</p>
        </div>
        <Button variant="outline" onClick={fetchDefaulters}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="metric-card border-destructive/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Defaulters</p>
                <p className="text-2xl font-bold text-destructive">{defaulters.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive/20" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="metric-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Outstanding</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(defaulters.reduce((sum, d) => sum + d.outstandingTotal, 0))}
                </p>
              </div>
              <IndianRupee className="h-8 w-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Days Overdue</p>
                <p className="text-2xl font-bold">
                  {defaulters.length > 0 
                    ? Math.round(defaulters.reduce((sum, d) => sum + d.daysOverdue, 0) / defaulters.length)
                    : 0
                  }
                </p>
              </div>
              <Clock className="h-8 w-8 text-warning/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, loan number, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Defaulters Table */}
      <Card>
        <CardHeader>
          <CardTitle>Defaulted Loans</CardTitle>
          <CardDescription>
            {filteredDefaulters.length} defaulted loans found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredDefaulters.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Borrower</TableHead>
                  <TableHead>Loan #</TableHead>
                  <TableHead>Outstanding</TableHead>
                  <TableHead>Days Overdue</TableHead>
                  <TableHead>Penalty</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDefaulters.map((defaulter) => (
                  <TableRow key={defaulter.loan.id} className="bg-destructive/5">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border-2 border-destructive/20">
                          <AvatarFallback className="bg-destructive/10 text-destructive text-sm">
                            {defaulter.borrowerName ? getInitials(defaulter.borrowerName) : '??'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{defaulter.borrowerName || 'Unknown'}</p>
                          {defaulter.borrowerPhone && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {defaulter.borrowerPhone}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link 
                        to={`/loans/${defaulter.loan.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {defaulter.loan.loanNumber}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-semibold text-destructive">
                          {formatCurrency(defaulter.outstandingTotal)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          P: {formatCurrency(Number(defaulter.loan.currentPrincipal))}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="destructive" className="font-mono">
                        {defaulter.daysOverdue} days
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {defaulter.daysOverdue > 0 && (
                        <div className="text-sm">
                          <span className="font-medium text-destructive">
                            +{calculatePenaltyMonths(defaulter.daysOverdue)} month{calculatePenaltyMonths(defaulter.daysOverdue) > 1 ? 's' : ''}
                          </span>
                          <p className="text-xs text-muted-foreground">
                            interest penalty
                          </p>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link to={`/loans/${defaulter.loan.id}`}>
                        <Button size="sm" variant="outline">
                          View Details
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No defaulters found</p>
              {searchQuery && (
                <p className="text-sm mt-1">Try a different search term</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
