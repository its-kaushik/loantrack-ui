import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  CalendarDays, 
  AlertCircle, 
  Loader2, 
  RefreshCw,
  ChevronRight,
  Check,
  X,
  Clock
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
import { api, Loan } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface DailyLoanCard {
  loan: Loan;
  filledBoxes: number;
  totalBoxes: number;
  isLateToday: boolean;
  penaltyMonths: number;
}

export default function DailyLoans() {
  const [loanCards, setLoanCards] = useState<DailyLoanCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState<DailyLoanCard | null>(null);
  const [isCollecting, setIsCollecting] = useState(false);

  const fetchLoans = async () => {
    setIsLoading(true);
    try {
      const response = await api.getLoans({ status: 'ACTIVE' });
      if (response.success) {
        // Filter for daily loans (Type B has termDays)
        const dailyLoans = response.data.filter(loan => loan.termDays && loan.termDays > 0);
        
        // Calculate card data for each loan
        const cards: DailyLoanCard[] = dailyLoans.map(loan => {
          const totalBoxes = loan.termDays || 100;
          const startDate = new Date(loan.startDate);
          const today = new Date();
          const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
          
          // Calculate filled boxes based on payments made
          const dailyAmount = loan.dailyInstallment || (loan.totalExpectedAmount / totalBoxes);
          const totalPaid = loan.totalPrincipalPaid + loan.totalInterestPaid;
          const filledBoxes = Math.floor(totalPaid / dailyAmount);
          
          // Check if late today (expected boxes > filled boxes)
          const expectedBoxes = Math.min(daysSinceStart + 1, totalBoxes);
          const isLateToday = filledBoxes < expectedBoxes;
          
          // Calculate penalty months (if exceeded term)
          const daysOverdue = Math.max(0, daysSinceStart - totalBoxes);
          const penaltyMonths = Math.ceil(daysOverdue / 30);

          return {
            loan,
            filledBoxes: Math.min(filledBoxes, totalBoxes),
            totalBoxes,
            isLateToday,
            penaltyMonths
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

  const handleFillBox = async () => {
    if (!selectedLoan) return;
    
    setIsCollecting(true);
    try {
      const nextBox = selectedLoan.filledBoxes + 1;
      await api.collectDailyPayment(selectedLoan.loan.id, { dayNumber: nextBox });
      toast({
        title: "Payment Collected",
        description: `Box #${nextBox} filled for ${selectedLoan.loan.loanNumber}`,
      });
      setSelectedLoan(null);
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
        <Button variant="outline" onClick={fetchLoans}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-3">
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

      {/* Loan Cards Grid */}
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
                    {formatCurrency(card.loan.dailyInstallment || 0)}/day
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
                  onClick={() => setSelectedLoan(card)}
                  disabled={card.filledBoxes >= card.totalBoxes}
                >
                  Fill Box #{card.filledBoxes + 1}
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

        {loanCards.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center text-muted-foreground">
              <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No active daily loans found</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Fill Box Confirmation Dialog */}
      <Dialog open={!!selectedLoan} onOpenChange={() => setSelectedLoan(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fill Box #{selectedLoan?.filledBoxes ? selectedLoan.filledBoxes + 1 : 1}</DialogTitle>
            <DialogDescription>
              {selectedLoan?.loan.loanNumber} - Record today's payment
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="bg-muted rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Daily Amount</span>
                <span className="font-medium">
                  {formatCurrency(selectedLoan?.loan.dailyInstallment || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Box Number</span>
                <span className="font-medium">
                  #{selectedLoan?.filledBoxes ? selectedLoan.filledBoxes + 1 : 1} of {selectedLoan?.totalBoxes}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedLoan(null)}>
              Cancel
            </Button>
            <Button onClick={handleFillBox} disabled={isCollecting}>
              {isCollecting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
