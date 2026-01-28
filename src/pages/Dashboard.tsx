import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  IndianRupee,
  Calendar,
  CalendarDays,
  ArrowRight,
  Loader2,
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api, PortfolioSummary, DueCollection } from "@/lib/api";

interface DashboardMetrics {
  totalOutstanding: number;
  totalProfit: number;
  overdueCount: number;
  todayTarget: number;
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioSummary[]>([]);
  const [todayCollections, setTodayCollections] = useState<DueCollection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [portfolioRes, collectionsRes, overdueRes] = await Promise.all([
        api.getPortfolioSummary(),
        api.getDailyCollection(),
        api.getOverdueLoans()
      ]);

      if (portfolioRes.success) {
        setPortfolio(portfolioRes.data);
        
        // Calculate aggregated metrics
        const totalOutstanding = portfolioRes.data.reduce((sum, p) => sum + p.totalOutstanding, 0);
        const totalProfit = portfolioRes.data.reduce((sum, p) => sum + p.totalInterestEarned + p.totalPenaltyEarned, 0);
        
        setMetrics({
          totalOutstanding,
          totalProfit,
          overdueCount: overdueRes.success ? overdueRes.data.length : 0,
          todayTarget: collectionsRes.success 
            ? collectionsRes.data.reduce((sum, c) => sum + c.dueAmount, 0) 
            : 0
        });
      }

      if (collectionsRes.success) {
        setTodayCollections(collectionsRes.data.slice(0, 5));
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to Load Dashboard</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchDashboardData}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your loan portfolio</p>
        </div>
        <Button variant="outline" onClick={fetchDashboardData}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Outstanding Principal */}
        <Card className="metric-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Outstanding
            </CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(metrics?.totalOutstanding || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all active loans
            </p>
          </CardContent>
        </Card>

        {/* Total Profit */}
        <Card className="metric-card-accent">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-primary-foreground/80">
              Total Profit
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-primary-foreground/80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary-foreground">
              {formatCurrency(metrics?.totalProfit || 0)}
            </div>
            <p className="text-xs text-primary-foreground/70 mt-1">
              Interest + Penalties collected
            </p>
          </CardContent>
        </Card>

        {/* Overdue Count */}
        <Card className="metric-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overdue Loans
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {metrics?.overdueCount || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Require immediate attention
            </p>
          </CardContent>
        </Card>

        {/* Today's Target */}
        <Card className="metric-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today's Target
            </CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(metrics?.todayTarget || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Daily collection target
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio & Collections */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Portfolio Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Summary</CardTitle>
            <CardDescription>Breakdown by loan type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {portfolio.length > 0 ? portfolio.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    {item.loanType.includes('Monthly') ? (
                      <Calendar className="h-5 w-5 text-primary" />
                    ) : (
                      <CalendarDays className="h-5 w-5 text-accent" />
                    )}
                    <div>
                      <p className="font-medium">{item.loanType}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.activeLoans} active of {item.totalLoans} total
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(item.totalOutstanding)}</p>
                    <p className="text-sm text-success">
                      +{formatCurrency(item.totalInterestEarned)}
                    </p>
                  </div>
                </div>
              )) : (
                <p className="text-muted-foreground text-center py-8">No portfolio data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Today's Collections */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Today's Collections</CardTitle>
              <CardDescription>Due payments for today</CardDescription>
            </div>
            <Link to="/loans/daily">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todayCollections.length > 0 ? todayCollections.map((collection, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-medium">{collection.borrowerName}</p>
                    <p className="text-sm text-muted-foreground">{collection.loanNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(collection.dueAmount)}</p>
                    {collection.daysOverdue > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {collection.daysOverdue}d overdue
                      </Badge>
                    )}
                  </div>
                </div>
              )) : (
                <p className="text-muted-foreground text-center py-8">No collections due today</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link to="/loans/monthly">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                <Calendar className="h-6 w-6 text-primary" />
                <span>Monthly Loans</span>
              </Button>
            </Link>
            <Link to="/loans/daily">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                <CalendarDays className="h-6 w-6 text-accent" />
                <span>Daily Loans</span>
              </Button>
            </Link>
            <Link to="/borrowers">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                <TrendingUp className="h-6 w-6 text-success" />
                <span>Borrowers</span>
              </Button>
            </Link>
            <Link to="/defaulters">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                <AlertTriangle className="h-6 w-6 text-destructive" />
                <span>Defaulters</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
