import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiService } from "@/lib/apiService";
import { authUtils } from "@/lib/auth";
import { toast } from "@/hooks/use-toast";
import { DollarSign, TrendingDown, TrendingUp, Wallet, ArrowUpCircle, ArrowDownCircle, Download } from "lucide-react";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Skeleton } from "@/components/ui/skeleton";

const Finance = () => {
  const user = authUtils.getAuth();
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"expense" | "income">("expense");
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: "", icon: "💰", color: "#10b981", budget: "" });
  const [walletDialogOpen, setWalletDialogOpen] = useState(false);
  const [walletForm, setWalletForm] = useState({ name: "", balance: "" });
  const [wallets, setWallets] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [incomes, setIncomes] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    walletId: "",
    categoryId: "",
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    loadFinanceData();
  }, []);

  const loadFinanceData = async () => {
    try {
      setLoading(true);
      if (!user?.familyId) return;

      const [walletsData, categoriesData, expensesData, incomesData] = await Promise.all([
        apiService.getWallets(user.familyId),
        apiService.getCategories(user.familyId),
        apiService.getExpenses(user.familyId),
        apiService.getIncomes(user.familyId),
      ]);

      // Calculate wallet balances from transactions
      const calculatedWallets = walletsData.map(wallet => {
        const walletExpenses = expensesData.filter(e => e.walletId === wallet.id);
        const walletIncomes = incomesData.filter(i => i.walletId === wallet.id);
        const totalExpenses = walletExpenses.reduce((sum, e) => sum + e.amount, 0);
        const totalIncomes = walletIncomes.reduce((sum, i) => sum + i.amount, 0);
        const calculatedBalance = (wallet.initialBalance || 0) + totalIncomes - totalExpenses;
        
        return {
          ...wallet,
          balance: calculatedBalance
        };
      });

      setWallets(calculatedWallets);
      setCategories(categoriesData);
      setExpenses(expensesData);
      setIncomes(incomesData);
      
      if (calculatedWallets.length > 0) {
        setFormData(prev => ({ ...prev, walletId: calculatedWallets[0].id }));
      }
      if (categoriesData.length > 0) {
        setFormData(prev => ({ ...prev, categoryId: categoriesData[0].id }));
      }
    } catch (error) {
      toast({
        title: "Error loading data",
        description: "Failed to load finance information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openDialog = (type: "expense" | "income", transaction?: any) => {
    setDialogType(type);
    setEditingTransaction(transaction);
    
    if (transaction) {
      setFormData({
        walletId: transaction.walletId,
        categoryId: transaction.categoryId,
        amount: transaction.amount.toString(),
        description: transaction.description,
        date: transaction.date.split('T')[0],
      });
    } else {
      setFormData(prev => ({ 
        ...prev, 
        categoryId: categories.length > 0 ? categories[0].id : "",
        walletId: wallets.length > 0 ? wallets[0].id : ""
      }));
    }
    setDialogOpen(true);
  };

  const handleAdd = async () => {
    try {
      if (!formData.categoryId || !formData.amount || !formData.description) {
        toast({ title: "Missing fields", description: "Please fill in all fields", variant: "destructive" });
        return;
      }

      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        toast({ title: "Invalid amount", variant: "destructive" });
        return;
      }

      const walletId = formData.walletId || wallets[0]?.id;
      if (!walletId) {
        toast({ title: "No wallet available", variant: "destructive" });
        return;
      }

      const data = {
        familyId: user?.familyId,
        walletId,
        categoryId: formData.categoryId,
        amount,
        description: formData.description,
        date: formData.date,
        createdBy: user?.memberId,
      };

      // Handle edit vs add
      if (editingTransaction) {
        if (dialogType === "expense") {
          await apiService.updateExpense(editingTransaction.id, data);
          toast({ title: "Expense updated" });
        } else {
          await apiService.updateIncome(editingTransaction.id, data);
          toast({ title: "Income updated" });
        }
      } else {
        if (dialogType === "expense") {
          await apiService.addExpense(data);
          toast({ title: "Expense added" });
        } else {
          await apiService.addIncome(data);
          toast({ title: "Income added" });
        }
      }

      setDialogOpen(false);
      setEditingTransaction(null);
      setFormData({
        walletId: wallets[0]?.id || "",
        categoryId: categories[0]?.id || "",
        amount: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
      });
      
      // Re-fetch all data from Firebase after transaction
      await loadFinanceData();
    } catch (error: any) {
      toast({ title: "Failed to add transaction", description: error.message, variant: "destructive" });
    }
  };

  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
  const allTransactions = [
    ...expenses.map(e => ({ ...e, type: 'expense' as const })),
    ...incomes.map(i => ({ ...i, type: 'income' as const }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Finance</h1>
          <p className="text-muted-foreground">Manage your family finances</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => openDialog("income")} variant="outline" className="gap-2">
            <ArrowUpCircle className="h-4 w-4" />
            Add Income
          </Button>
          <Button onClick={() => openDialog("expense")} className="gap-2">
            <ArrowDownCircle className="h-4 w-4" />
            Add Expense
          </Button>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTransaction 
                ? `Edit ${dialogType === "expense" ? "Expense" : "Income"}` 
                : `Add ${dialogType === "expense" ? "Expense" : "Income"}`}
            </DialogTitle>
            <DialogDescription>
              {editingTransaction ? `Update this ${dialogType}` : `Record a new ${dialogType}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {wallets.length === 0 && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">No wallet available. Please add a wallet first.</p>
                <Button 
                  type="button" 
                  size="sm" 
                  onClick={() => setWalletDialogOpen(true)}
                >
                  + Add Wallet
                </Button>
              </div>
            )}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="category">Category</Label>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setCategoryDialogOpen(true)}
                  className="h-6 text-xs"
                >
                  + Add Category
                </Button>
              </div>
              <Select 
                value={formData.categoryId} 
                onValueChange={(val) => setFormData({ ...formData, categoryId: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">No categories. Click "Add Category" above.</div>
                  ) : (
                    categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.icon} {c.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input type="number" step="0.01" placeholder="0.00" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input placeholder="What was this for?" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setDialogOpen(false);
              setEditingTransaction(null);
            }}>Cancel</Button>
            <Button onClick={handleAdd}>
              {editingTransaction 
                ? `Update ${dialogType === "expense" ? "Expense" : "Income"}` 
                : `Add ${dialogType === "expense" ? "Expense" : "Income"}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
            <DialogDescription>Create a new expense/income category</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Category Name</Label>
              <Input 
                placeholder="Groceries, Salary, etc." 
                value={categoryForm.name} 
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} 
              />
            </div>
            <div className="space-y-2">
              <Label>Icon (emoji)</Label>
              <Input 
                placeholder="🛍️" 
                value={categoryForm.icon} 
                onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })} 
              />
            </div>
            <div className="space-y-2">
              <Label>Budget (optional)</Label>
              <Input 
                type="number" 
                placeholder="500" 
                value={categoryForm.budget} 
                onChange={(e) => setCategoryForm({ ...categoryForm, budget: e.target.value })} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>Cancel</Button>
            <Button onClick={async () => {
              if (!categoryForm.name) {
                toast({ title: "Name required", variant: "destructive" });
                return;
              }
              const newCategory = await apiService.addCategory({
                familyId: user?.familyId,
                name: categoryForm.name,
                icon: categoryForm.icon || "💰",
                color: categoryForm.color,
                budget: categoryForm.budget ? parseFloat(categoryForm.budget) : 0
              });
              setCategories([...categories, newCategory]);
              setFormData({ ...formData, categoryId: newCategory.id });
              setCategoryDialogOpen(false);
              setCategoryForm({ name: "", icon: "💰", color: "#10b981", budget: "" });
              toast({ title: "Category added" });
            }}>Add Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={walletDialogOpen} onOpenChange={setWalletDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Wallet</DialogTitle>
            <DialogDescription>Create a new wallet to track your money</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Wallet Name</Label>
              <Input 
                placeholder="Family Wallet, Savings, etc." 
                value={walletForm.name} 
                onChange={(e) => setWalletForm({ ...walletForm, name: e.target.value })} 
              />
            </div>
            <div className="space-y-2">
              <Label>Initial Balance</Label>
              <Input 
                type="number" 
                step="0.01"
                placeholder="0.00" 
                value={walletForm.balance} 
                onChange={(e) => setWalletForm({ ...walletForm, balance: e.target.value })} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWalletDialogOpen(false)}>Cancel</Button>
            <Button onClick={async () => {
              if (!walletForm.name) {
                toast({ title: "Name required", variant: "destructive" });
                return;
              }
              try {
                await apiService.addWallet({
                  familyId: user?.familyId,
                  name: walletForm.name,
                  balance: walletForm.balance ? parseFloat(walletForm.balance) : 0,
                  currency: "INR",
                  isShared: true
                });
                setWalletDialogOpen(false);
                setWalletForm({ name: "", balance: "" });
                toast({ title: "Wallet added" });
                await loadFinanceData();
              } catch (error: any) {
                toast({ title: "Failed to add wallet", description: error.message, variant: "destructive" });
              }
            }}>Add Wallet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Wallets</CardTitle>
              <CardDescription>Manage your wallets</CardDescription>
            </div>
            <Button size="sm" onClick={() => setWalletDialogOpen(true)}>+ Add Wallet</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {wallets.map((wallet) => (
              <div key={wallet.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-semibold">{wallet.name}</p>
                  <p className="text-sm text-muted-foreground">₹{wallet.balance.toFixed(2)}</p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={async () => {
                    if (wallets.length === 1) {
                      toast({ title: "Cannot delete", description: "You need at least one wallet", variant: "destructive" });
                      return;
                    }
                    try {
                      await apiService.deleteWallet(wallet.id);
                      toast({ title: "Wallet deleted" });
                      await loadFinanceData();
                    } catch (error: any) {
                      toast({ title: "Failed to delete wallet", description: error.message, variant: "destructive" });
                    }
                  }}
                >
                  🗑️
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent hover:shadow-lg transition-all">
          <div className="absolute top-0 right-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-primary/10 blur-2xl" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Balance</CardTitle>
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-4xl font-bold text-primary mb-2">₹{totalBalance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Across all wallets</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-success/20 bg-gradient-to-br from-success/10 via-success/5 to-transparent hover:shadow-lg transition-all">
          <div className="absolute top-0 right-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-success/10 blur-2xl" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Income</CardTitle>
            <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-success" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-4xl font-bold text-success mb-2">₹{totalIncome.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-destructive/20 bg-gradient-to-br from-destructive/10 via-destructive/5 to-transparent hover:shadow-lg transition-all">
          <div className="absolute top-0 right-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-destructive/10 blur-2xl" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
            <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-destructive" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-4xl font-bold text-destructive mb-2">₹{totalExpenses.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="border-b bg-muted/20 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Transactions</CardTitle>
                <CardDescription className="text-xs">Your income and expenses</CardDescription>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={async () => {
                try {
                  const doc = new jsPDF();
                  
                  // Header with gradient effect
                  doc.setFillColor(59, 130, 246);
                  doc.rect(0, 0, 210, 40, 'F');
                  doc.setFillColor(37, 99, 235);
                  doc.rect(0, 30, 210, 10, 'F');
                  
                  doc.setFontSize(24);
                  doc.setTextColor(255, 255, 255);
                  doc.text('FAMILYHUB', 20, 20);
                  doc.setFontSize(12);
                  doc.text('Financial Report', 20, 30);
                  doc.setFontSize(8);
                  doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 140, 35);
                  
                  // Summary Cards
                  let y = 55;
                  
                  // Balance Card
                  doc.setFillColor(240, 253, 244);
                  doc.rect(15, y, 180, 25, 'F');
                  doc.setDrawColor(34, 197, 94);
                  doc.setLineWidth(0.5);
                  doc.rect(15, y, 180, 25, 'S');
                  doc.setFontSize(14);
                  doc.setTextColor(22, 163, 74);
                  doc.text('TOTAL BALANCE', 20, y + 8);
                  doc.setFontSize(20);
                  doc.setTextColor(21, 128, 61);
                  doc.text(`$${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 20, y + 18);
                  
                  y += 35;
                  
                  // Income/Expense Cards Side by Side
                  doc.setFillColor(239, 246, 255);
                  doc.rect(15, y, 85, 20, 'F');
                  doc.setDrawColor(59, 130, 246);
                  doc.rect(15, y, 85, 20, 'S');
                  doc.setFontSize(10);
                  doc.setTextColor(37, 99, 235);
                  doc.text('INCOME', 20, y + 7);
                  doc.setFontSize(14);
                  doc.text(`+$${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 20, y + 15);
                  
                  doc.setFillColor(254, 242, 242);
                  doc.rect(110, y, 85, 20, 'F');
                  doc.setDrawColor(239, 68, 68);
                  doc.rect(110, y, 85, 20, 'S');
                  doc.setTextColor(220, 38, 38);
                  doc.text('EXPENSES', 115, y + 7);
                  doc.text(`-$${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 115, y + 15);
                  
                  y += 35;
                  
                  // Wallets Section
                  doc.setFillColor(249, 250, 251);
                  doc.rect(15, y, 180, 15 + (wallets.length * 8), 'F');
                  doc.setDrawColor(156, 163, 175);
                  doc.rect(15, y, 180, 15 + (wallets.length * 8), 'S');
                  
                  doc.setFontSize(12);
                  doc.setTextColor(75, 85, 99);
                  doc.text('WALLETS', 20, y + 10);
                  
                  doc.setFontSize(9);
                  doc.setTextColor(0, 0, 0);
                  let walletY = y + 18;
                  wallets.forEach((wallet, index) => {
                    doc.text(`${index + 1}. ${wallet.name}`, 25, walletY);
                    doc.setTextColor(22, 163, 74);
                    doc.text(`$${wallet.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 140, walletY);
                    doc.setTextColor(0, 0, 0);
                    walletY += 8;
                  });
                  
                  y = walletY + 15;
                  
                  // Transactions Table
                  doc.setFillColor(31, 41, 55);
                  doc.rect(15, y, 180, 15, 'F');
                  doc.setFontSize(12);
                  doc.setTextColor(255, 255, 255);
                  doc.text('RECENT TRANSACTIONS', 20, y + 10);
                  
                  y += 20;
                  
                  // Table Headers
                  doc.setFillColor(243, 244, 246);
                  doc.rect(15, y, 180, 10, 'F');
                  doc.setDrawColor(209, 213, 219);
                  doc.rect(15, y, 180, 10, 'S');
                  
                  doc.setFontSize(8);
                  doc.setTextColor(75, 85, 99);
                  doc.text('DATE', 20, y + 6);
                  doc.text('TYPE', 50, y + 6);
                  doc.text('CATEGORY', 75, y + 6);
                  doc.text('DESCRIPTION', 115, y + 6);
                  doc.text('AMOUNT', 165, y + 6);
                  
                  y += 15;
                  
                  // Transaction Rows
                  allTransactions.slice(0, 20).forEach((t, index) => {
                    const cat = categories.find(c => c.id === t.categoryId);
                    
                    if (index % 2 === 0) {
                      doc.setFillColor(249, 250, 251);
                      doc.rect(15, y - 2, 180, 8, 'F');
                    }
                    
                    doc.setFontSize(7);
                    doc.setTextColor(0, 0, 0);
                    doc.text(new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), 20, y + 2);
                    
                    if (t.type === 'income') {
                      doc.setTextColor(22, 163, 74);
                      doc.text('IN', 50, y + 2);
                    } else {
                      doc.setTextColor(220, 38, 38);
                      doc.text('OUT', 50, y + 2);
                    }
                    
                    doc.setTextColor(75, 85, 99);
                    doc.text((cat?.name || 'Other').substring(0, 12), 75, y + 2);
                    doc.text(t.description.substring(0, 20), 115, y + 2);
                    
                    if (t.type === 'income') {
                      doc.setTextColor(22, 163, 74);
                      doc.text(`+$${t.amount.toFixed(2)}`, 165, y + 2);
                    } else {
                      doc.setTextColor(220, 38, 38);
                      doc.text(`-$${t.amount.toFixed(2)}`, 165, y + 2);
                    }
                    
                    y += 8;
                    if (y > 270) {
                      doc.addPage();
                      y = 30;
                    }
                  });
                  
                  // Footer
                  doc.setFillColor(59, 130, 246);
                  doc.rect(0, 287, 210, 10, 'F');
                  doc.setFontSize(7);
                  doc.setTextColor(255, 255, 255);
                  doc.text('FamilyHub - Your Family\'s Smart Financial OS', 20, 293);
                  doc.text(`Page 1 of ${doc.getNumberOfPages()}`, 170, 293);
                  
                  const pdfBlob = doc.output('blob');
                  const url = URL.createObjectURL(pdfBlob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `FamilyHub_Financial_Report_${new Date().toISOString().split('T')[0]}.pdf`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                  
                  toast({ title: "Professional PDF downloaded!" });
                } catch (error) {
                  console.error('PDF error:', error);
                  toast({ title: "Download failed", variant: "destructive" });
                }
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs defaultValue="all">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="income">Income</TabsTrigger>
              <TabsTrigger value="expense">Expenses</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-3">
              {allTransactions.length === 0 ? (
                <div className="text-center py-16">
                  <h3 className="text-lg font-semibold mb-2">No transactions yet</h3>
                  <p className="text-sm text-muted-foreground mb-6">Start tracking your finances</p>
                </div>
              ) : (
                allTransactions.slice(0, 10).map((t) => {
                  const category = categories.find(c => c.id === t.categoryId);
                  const isIncome = t.type === 'income';
                  return (
                    <div key={t.id} className="flex items-center justify-between p-4 rounded-xl border border-border/40 bg-card hover:shadow-md transition-all group">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${isIncome ? 'bg-gradient-to-br from-success/10 to-success/5' : 'bg-gradient-to-br from-destructive/10 to-destructive/5'}`}>
                          <span className="text-xl">{category?.icon || (isIncome ? "💰" : "💸")}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{t.description}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-muted/50">{category?.name}</span>
                            <span>•</span>
                            <span className="text-xs">{new Date(t.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className={`text-xl font-bold ${isIncome ? 'text-success' : 'text-destructive'}`}>
                          {isIncome ? '+' : '-'}₹{t.amount.toFixed(2)}
                        </p>
                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => openDialog(isIncome ? 'income' : 'expense', t)}
                          >
                            ✏️
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={async () => {
                              try {
                                if (isIncome) {
                                  await apiService.deleteIncome(t.id);
                                } else {
                                  await apiService.deleteExpense(t.id);
                                }
                                toast({ title: "Transaction deleted" });
                                await loadFinanceData();
                              } catch (error: any) {
                                toast({ title: "Delete failed", description: error.message, variant: "destructive" });
                              }
                            }}
                          >
                            <span className="text-destructive">🗑️</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </TabsContent>

            <TabsContent value="income" className="space-y-3">
              {incomes.length === 0 ? (
                <div className="text-center py-16">
                  <h3 className="text-lg font-semibold mb-2">No income recorded</h3>
                  <Button onClick={() => openDialog("income")} size="lg"><ArrowUpCircle className="mr-2 h-4 w-4" />Add Income</Button>
                </div>
              ) : (
                incomes.slice(0, 10).map((income) => {
                  const category = categories.find(c => c.id === income.categoryId);
                  return (
                    <div key={income.id} className="flex items-center justify-between p-4 rounded-xl border bg-card hover:shadow-md transition-all">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-success/10 to-success/5 flex items-center justify-center">
                          <span className="text-xl">{category?.icon || "💰"}</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{income.description}</p>
                          <p className="text-xs text-muted-foreground">{new Date(income.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-xl font-bold text-success">+₹{income.amount.toFixed(2)}</p>
                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => openDialog('income', income)}
                          >
                            ✏️
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={async () => {
                              try {
                                await apiService.deleteIncome(income.id);
                                toast({ title: "Income deleted" });
                                await loadFinanceData();
                              } catch (error: any) {
                                toast({ title: "Delete failed", description: error.message, variant: "destructive" });
                              }
                            }}
                          >
                            <span className="text-destructive">🗑️</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </TabsContent>

            <TabsContent value="expense" className="space-y-3">
              {expenses.length === 0 ? (
                <div className="text-center py-16">
                  <h3 className="text-lg font-semibold mb-2">No expenses recorded</h3>
                  <Button onClick={() => openDialog("expense")} size="lg"><ArrowDownCircle className="mr-2 h-4 w-4" />Add Expense</Button>
                </div>
              ) : (
                expenses.slice(0, 10).map((expense) => {
                  const category = categories.find(c => c.id === expense.categoryId);
                  return (
                    <div key={expense.id} className="flex items-center justify-between p-4 rounded-xl border bg-card hover:shadow-md transition-all">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-destructive/10 to-destructive/5 flex items-center justify-center">
                          <span className="text-xl">{category?.icon || "💸"}</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{expense.description}</p>
                          <p className="text-xs text-muted-foreground">{new Date(expense.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-xl font-bold text-destructive">-₹{expense.amount.toFixed(2)}</p>
                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => openDialog('expense', expense)}
                          >
                            ✏️
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={async () => {
                              try {
                                await apiService.deleteExpense(expense.id);
                                toast({ title: "Expense deleted" });
                                await loadFinanceData();
                              } catch (error: any) {
                                toast({ title: "Delete failed", description: error.message, variant: "destructive" });
                              }
                            }}
                          >
                            <span className="text-destructive">🗑️</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Finance;