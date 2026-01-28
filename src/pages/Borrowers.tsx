import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  Users, 
  Search, 
  Loader2, 
  RefreshCw,
  Phone,
  MapPin,
  ChevronRight,
  AlertTriangle,
  Plus
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
import { api, Borrower } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

export default function Borrowers() {
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchBorrowers = async () => {
    setIsLoading(true);
    try {
      const response = await api.getBorrowers({ 
        search: searchQuery || undefined,
        limit: 50 
      });
      if (response.success) {
        setBorrowers(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch borrowers:', err);
      toast({
        title: "Error",
        description: "Failed to load borrowers",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrowers();
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchBorrowers();
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

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

  if (isLoading && borrowers.length === 0) {
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
            <Users className="h-6 w-6 text-primary" />
            Borrowers
          </h1>
          <p className="text-muted-foreground">Manage your borrower database</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Borrower
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" onClick={fetchBorrowers}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Borrowers Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Borrowers</CardTitle>
          <CardDescription>
            {borrowers.length} borrowers found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {borrowers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Borrower</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Income</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {borrowers.map((borrower) => (
                  <TableRow key={borrower.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            {getInitials(borrower.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{borrower.fullName}</p>
                          {borrower.occupation && (
                            <p className="text-xs text-muted-foreground">{borrower.occupation}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        {borrower.phone}
                      </div>
                      {borrower.altPhone && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <Phone className="h-3 w-3" />
                          {borrower.altPhone}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {borrower.city}
                      </div>
                    </TableCell>
                    <TableCell>
                      {borrower.monthlyIncome ? (
                        <span className="text-sm">{formatCurrency(borrower.monthlyIncome)}/mo</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {borrower.isBlacklisted ? (
                        <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                          <AlertTriangle className="h-3 w-3" />
                          Blacklisted
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="status-active w-fit">
                          Active
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost">
                        View Details
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No borrowers found</p>
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
