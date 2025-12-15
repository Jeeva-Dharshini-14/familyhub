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
import { Skeleton } from "@/components/ui/skeleton";

const Finance = () => {
  const user = authUtils.getAuth();
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"expense" | "income">("expense");
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
      if (!user?.familyId) return;

      const [walletsData, categoriesData, expensesData, incomesData] = await Promise.all([
        apiService.getWallets(user.familyId),
        apiService.getCategories(user.familyId),
        apiService.getExpenses(user.familyId),
        apiService.getIncomes(user.familyId),
      ]);

      setWallets(walletsData);
      setCategories(categoriesData);
      setExpenses(expensesData);
      setIncomes(incomesData);
      
      if (walletsData.length > 0) {
        setFormData(prev => ({ ...prev, walletId: walletsData[0].id }));
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

  const openDialog = (type: "expense" | "income") => {
    setDialogType(type);
    setFormData(prev => ({ 
      ...prev, 
      categoryId: categories.length > 0 ? categories[0].id : "",
      walletId: wallets.length > 0 ? wallets[0].id : ""
    }));
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

      if (dialogType === "expense") {
        await apiService.addExpense(data);
        toast({ title: "Expense added" });
      } else {
        await apiService.addIncome(data);
        toast({ title: "Income added" });
      }

      setDialogOpen(false);
      setFormData({
        walletId: wallets[0]?.id || "",
        categoryId: categories[0]?.id || "",
        amount: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
      });
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
            <DialogTitle>{dialogType === "expense" ? "Add Expense" : "Add Income"}</DialogTitle>
            <DialogDescription>Record a new {dialogType}</DialogDescription>
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
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd}>{dialogType === "expense" ? "Add Expense" : "Add Income"}</Button>
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
              const newWallet = await apiService.addWallet({
                familyId: user?.familyId,
                name: walletForm.name,
                balance: walletForm.balance ? parseFloat(walletForm.balance) : 0,
                currency: "USD",
                isShared: true
              });
              setWallets([...wallets, newWallet]);
              setFormData({ ...formData, walletId: newWallet.id });
              setWalletDialogOpen(false);
              setWalletForm({ name: "", balance: "" });
              toast({ title: "Wallet added" });
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
                  <p className="text-sm text-muted-foreground">${wallet.balance.toFixed(2)}</p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    if (wallets.length === 1) {
                      toast({ title: "Cannot delete", description: "You need at least one wallet", variant: "destructive" });
                      return;
                    }
                    setWallets(wallets.filter(w => w.id !== wallet.id));
                    toast({ title: "Wallet deleted" });
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
            <div className="text-4xl font-bold text-primary mb-2">${totalBalance.toFixed(2)}</div>
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
            <div className="text-4xl font-bold text-success mb-2">${totalIncome.toFixed(2)}</div>
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
            <div className="text-4xl font-bold text-destructive mb-2">${totalExpenses.toFixed(2)}</div>
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
              onClick={() => {
                const printWindow = window.open('', '', 'width=800,height=600');
                printWindow?.document.write(`
                  <html>
                    <head>
                      <title>Transaction Report</title>
                      <style>
                        body { font-family: Arial, sans-serif; padding: 40px; }
                        h1 { color: #333; border-bottom: 2px solid #3b9ff3; padding-bottom: 10px; }
                        h2 { color: #555; margin-top: 30px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
                        th { background-color: #f5f5f5; font-weight: bold; }
                        .summary { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
                        .summary-item { padding: 15px; background: #f9f9f9; border-radius: 8px; }
                        .income { color: #10b981; }
                        .expense { color: #ef4444; }
                      </style>
                    </head>
                    <body>
                      <h1>FamilyHub - Transaction Report</h1>
                      <p>Generated: ${new Date().toLocaleString()}</p>
                      
                      <h2>Summary</h2>
                      <div class="summary">
                        <div class="summary-item"><strong>Total Balance:</strong> $${totalBalance.toFixed(2)}</div>
                        <div class="summary-item"><strong>Net:</strong> $${(totalIncome - totalExpenses).toFixed(2)}</div>
                        <div class="summary-item income"><strong>Total Income:</strong> +$${totalIncome.toFixed(2)}</div>
                        <div class="summary-item expense"><strong>Total Expenses:</strong> -$${totalExpenses.toFixed(2)}</div>
                      </div>
                      
                      <h2>Wallets</h2>
                      <table>
                        <tr><th>Wallet Name</th><th>Balance</th></tr>
                        ${wallets.map(w => `<tr><td>${w.name}</td><td>$${w.balance.toFixed(2)}</td></tr>`).join('')}
                      </table>
                      
                      <h2>All Transactions</h2>
                      <table>
                        <tr><th>Date</th><th>Type</th><th>Category</th><th>Description</th><th>Amount</th></tr>
                        ${allTransactions.map(t => {
                          const cat = categories.find(c => c.id === t.categoryId);
                          return `<tr>
                            <td>${new Date(t.date).toLocaleDateString()}</td>
                            <td>${t.type}</td>
                            <td>${cat?.name || 'N/A'}</td>
                            <td>${t.description}</td>
                            <td class="${t.type}">${t.type === 'income' ? '+' : '-'}$${t.amount.toFixed(2)}</td>
                          </tr>`;
                        }).join('')}
                      </table>
                    </body>
                  </html>
                `);
                printWindow?.document.close();
                printWindow?.focus();
                setTimeout(() => {
                  printWindow?.print();
                  printWindow?.close();
                }, 250);
                toast({ title: "Opening print dialog" });
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
                          {isIncome ? '+' : '-'}${t.amount.toFixed(2)}
                        </p>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => {
                            if (isIncome) {
                              apiService.deleteIncome(t.id);
                            } else {
                              apiService.deleteExpense(t.id);
                            }
                            toast({ title: "Transaction deleted" });
                            loadFinanceData();
                          }}
                        >
                          <span className="text-destructive">🗑️</span>
                        </Button>
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
                        <p className="text-xl font-bold text-success">+${income.amount.toFixed(2)}</p>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => {
                            apiService.deleteIncome(income.id);
                            toast({ title: "Income deleted" });
                            loadFinanceData();
                          }}
                        >
                          <span className="text-destructive">🗑️</span>
                        </Button>
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
                        <p className="text-xl font-bold text-destructive">-${expense.amount.toFixed(2)}</p>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => {
                            apiService.deleteExpense(expense.id);
                            toast({ title: "Expense deleted" });
                            loadFinanceData();
                          }}
                        >
                          <span className="text-destructive">🗑️</span>
                        </Button>
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