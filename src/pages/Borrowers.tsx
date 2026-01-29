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
import { Label } from "@/components/ui/label";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { api, Borrower, CreateBorrowerRequest } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

const emptyForm: CreateBorrowerRequest = {
  fullName: "",
  phone: "",
  address: "",
};

export default function Borrowers() {
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<CreateBorrowerRequest>({ ...emptyForm });

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

  const handleAddBorrower = async () => {
    if (!form.fullName || form.fullName.length < 2) {
      toast({ title: "Validation Error", description: "Full name must be at least 2 characters", variant: "destructive" });
      return;
    }
    if (!form.phone || form.phone.length < 10) {
      toast({ title: "Validation Error", description: "Phone must be at least 10 digits", variant: "destructive" });
      return;
    }
    if (!form.address || form.address.length < 5) {
      toast({ title: "Validation Error", description: "Address must be at least 5 characters", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateBorrowerRequest = {
        fullName: form.fullName,
        phone: form.phone,
        address: form.address,
      };
      if (form.altPhone) payload.altPhone = form.altPhone;
      if (form.city) payload.city = form.city;
      if (form.occupation) payload.occupation = form.occupation;
      if (form.monthlyIncome) payload.monthlyIncome = form.monthlyIncome;
      if (form.idDocumentType) payload.idDocumentType = form.idDocumentType;
      if (form.idDocumentNumber) payload.idDocumentNumber = form.idDocumentNumber;
      if (form.notes) payload.notes = form.notes;

      await api.createBorrower(payload);
      toast({
        title: "Borrower Created",
        description: `${form.fullName} has been added`,
      });
      setShowAddDialog(false);
      setForm({ ...emptyForm });
      fetchBorrowers();
    } catch (err) {
      toast({
        title: "Failed to Create Borrower",
        description: err instanceof Error ? err.message : "Something went wrong",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <Button onClick={() => setShowAddDialog(true)}>
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
                      {borrower.city ? (
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          {borrower.city}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {borrower.monthlyIncome ? (
                        <span className="text-sm">{formatCurrency(parseFloat(borrower.monthlyIncome))}/mo</span>
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
                      <Link to={`/borrowers/${borrower.id}`}>
                        <Button size="sm" variant="ghost">
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
              <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No borrowers found</p>
              {searchQuery && (
                <p className="text-sm mt-1">Try a different search term</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Borrower Dialog */}
      <Dialog open={showAddDialog} onOpenChange={(open) => {
        setShowAddDialog(open);
        if (!open) setForm({ ...emptyForm });
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Borrower</DialogTitle>
            <DialogDescription>Enter borrower details. Fields marked with * are required.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
            {/* Required fields */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                placeholder="e.g. John Doe"
                value={form.fullName}
                onChange={(e) => setForm(f => ({ ...f, fullName: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                placeholder="e.g. 9876543210"
                value={form.phone}
                onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                placeholder="e.g. 123 Main Street, Apt 4"
                value={form.address}
                onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))}
              />
            </div>

            {/* Optional fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="e.g. Mumbai"
                  value={form.city || ""}
                  onChange={(e) => setForm(f => ({ ...f, city: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="altPhone">Alt Phone</Label>
                <Input
                  id="altPhone"
                  placeholder="e.g. 9123456789"
                  value={form.altPhone || ""}
                  onChange={(e) => setForm(f => ({ ...f, altPhone: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="occupation">Occupation</Label>
                <Input
                  id="occupation"
                  placeholder="e.g. Software Engineer"
                  value={form.occupation || ""}
                  onChange={(e) => setForm(f => ({ ...f, occupation: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthlyIncome">Monthly Income</Label>
                <Input
                  id="monthlyIncome"
                  type="number"
                  placeholder="e.g. 50000"
                  value={form.monthlyIncome || ""}
                  onChange={(e) => setForm(f => ({ ...f, monthlyIncome: e.target.value ? parseFloat(e.target.value) : undefined }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="idDocumentType">ID Document Type</Label>
                <Input
                  id="idDocumentType"
                  placeholder="e.g. Aadhar"
                  value={form.idDocumentType || ""}
                  onChange={(e) => setForm(f => ({ ...f, idDocumentType: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="idDocumentNumber">ID Document Number</Label>
                <Input
                  id="idDocumentNumber"
                  placeholder="e.g. 1234-5678-9012"
                  value={form.idDocumentNumber || ""}
                  onChange={(e) => setForm(f => ({ ...f, idDocumentNumber: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                placeholder="Any additional notes..."
                value={form.notes || ""}
                onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAddDialog(false); setForm({ ...emptyForm }); }}>
              Cancel
            </Button>
            <Button onClick={handleAddBorrower} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Borrower
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
