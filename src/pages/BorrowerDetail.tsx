import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Phone,
  MapPin,
  Briefcase,
  IndianRupee,
  CreditCard,
  FileText,
  AlertTriangle,
  Loader2,
  ChevronRight,
  CheckCircle2,
  CircleDashed,
  XCircle,
  Clock
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { api, Borrower, BorrowerStats, Loan, LoanStatus } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

export default function BorrowerDetail() {
  const { id } = useParams<{ id: string }>();
  const [borrower, setBorrower] = useState<Borrower | null>(null);
  const [stats, setStats] = useState<BorrowerStats | null>(null);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchBorrowerDetails();
  }, [id]);

  const fetchBorrowerDetails = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const [borrowerRes, statsRes, loansRes] = await Promise.all([
        api.getBorrower(id),
        api.getBorrowerStats(id),
        api.getLoans({ borrowerId: id }),
      ]);

      if (borrowerRes.success) setBorrower(borrowerRes.data);
      if (statsRes.success) setStats(statsRes.data);
      if (loansRes.success) setLoans(loansRes.data);
    } catch (err) {
      console.error("Failed to fetch borrower details:", err);
      toast({
        title: "Error",
        description: "Failed to load borrower details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num || 0);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: LoanStatus) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-500">
            <CircleDashed className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      case "ACTIVE":
        return (
          <Badge variant="outline" className="border-success text-success">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Active
          </Badge>
        );
      case "CLOSED":
        return (
          <Badge variant="outline" className="border-muted-foreground text-muted-foreground">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Closed
          </Badge>
        );
      case "DEFAULTED":
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!borrower) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Borrower Not Found</h3>
            <p className="text-muted-foreground mb-4">The borrower you're looking for doesn't exist.</p>
            <Link to="/borrowers">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Borrowers
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
      <div className="flex items-center gap-4">
        <Link to="/borrowers">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        {borrower.photoUrl ? (
          <img
            src={borrower.photoUrl}
            alt={borrower.fullName}
            className="h-12 w-12 rounded-full object-cover border"
          />
        ) : (
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg">
            {borrower.fullName.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">{borrower.fullName}</h1>
            {borrower.isBlacklisted ? (
              <Badge variant="destructive">
                <AlertTriangle className="mr-1 h-3 w-3" />
                Blacklisted
              </Badge>
            ) : (
              <Badge variant="outline" className="border-success text-success">Active</Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            Member since {formatDate(borrower.createdAt)}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Info & Stats */}
        <div className="space-y-6">
          {/* Contact & Personal Info */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>{borrower.phone}</span>
                </div>
                {borrower.altPhone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">{borrower.altPhone} (alt)</span>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <span>{borrower.address}{borrower.city ? `, ${borrower.city}` : ""}</span>
                </div>
                {borrower.occupation && (
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>{borrower.occupation}</span>
                  </div>
                )}
                {borrower.monthlyIncome && (
                  <div className="flex items-center gap-3">
                    <IndianRupee className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>{formatCurrency(borrower.monthlyIncome)}/month</span>
                  </div>
                )}
              </div>

              {(borrower.idDocumentType || borrower.idDocumentNumber) && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">ID Document</p>
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span>
                        {borrower.idDocumentType || "ID"}: {borrower.idDocumentNumber || "-"}
                      </span>
                    </div>
                  </div>
                </>
              )}

              {borrower.notes && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Notes</p>
                    <div className="flex items-start gap-3">
                      <FileText className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      <span className="text-sm">{borrower.notes}</span>
                    </div>
                  </div>
                </>
              )}

              {borrower.isBlacklisted && borrower.blacklistReason && (
                <>
                  <Separator />
                  <div className="rounded-lg bg-destructive/10 p-3 space-y-1">
                    <p className="text-sm font-medium text-destructive">Blacklist Reason</p>
                    <p className="text-sm">{borrower.blacklistReason}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Stats */}
          {stats && (
            <Card>
              <CardHeader>
                <CardTitle>Loan Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className="text-2xl font-bold">{stats.totalLoans}</p>
                    <p className="text-xs text-muted-foreground">Total Loans</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className="text-2xl font-bold text-success">{stats.activeLoans}</p>
                    <p className="text-xs text-muted-foreground">Active</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className="text-2xl font-bold">{stats.closedLoans}</p>
                    <p className="text-xs text-muted-foreground">Closed</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className="text-sm font-bold">{formatCurrency(stats.totalBorrowed)}</p>
                    <p className="text-xs text-muted-foreground">Total Borrowed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Loans */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Loans</CardTitle>
              <CardDescription>{loans.length} loan(s) found</CardDescription>
            </CardHeader>
            <CardContent>
              {loans.length > 0 ? (
                <div className="space-y-3">
                  {loans.map((loan) => (
                    <Link key={loan.id} to={`/loans/${loan.id}`}>
                      <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-4">
                          {getStatusBadge(loan.status)}
                          <div>
                            <p className="font-medium">{loan.loanNumber}</p>
                            <p className="text-sm text-muted-foreground">
                              {loan.termMonths ? `${loan.termMonths} months` : `${loan.termDays} days`}
                              {" "}at {loan.interestRate}%
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-semibold">{formatCurrency(loan.principalAmount)}</p>
                            {loan.status === "ACTIVE" && (
                              <p className="text-xs text-muted-foreground">
                                Outstanding: {formatCurrency(loan.outstandingPrincipal)}
                              </p>
                            )}
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No loans found for this borrower</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
