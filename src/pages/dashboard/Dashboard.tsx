import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, CheckSquare, Heart, Calendar as CalendarIcon, TrendingUp, TrendingDown, Plus, Bell, X } from "lucide-react";
import { apiService } from "@/lib/apiService";
import { authUtils } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";

const Dashboard = () => {
  const navigate = useNavigate();
  const user = authUtils.getAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    balance: 0,
    pendingTasks: 0,
    healthRecords: 0,
    upcomingEvents: 0,
    expenseChange: 0,
  });
  const [notifications, setNotifications] = useState<any[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<any[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
    loadNotifications();
    generateNotifications();
    
    // Refresh when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadDashboardData();
        loadNotifications();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Refresh every 30 seconds and check for new notifications
    const interval = setInterval(() => {
      loadDashboardData();
      generateNotifications();
    }, 30000);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      if (!user?.familyId) {
        setLoading(false);
        return;
      }

      const [wallets, tasks, healthRecords, expenses, incomes] = await Promise.all([
        apiService.getWallets(user.familyId),
        apiService.getTasks(user.familyId),
        apiService.getHealthRecords(user.familyId),
        apiService.getExpenses(user.familyId),
        apiService.getIncomes(user.familyId),
      ]);

      // Calculate wallet balances from transactions
      
      const calculatedWallets = wallets.map(wallet => {
        const walletExpenses = expenses.filter(e => e.walletId === wallet.id);
        const walletIncomes = incomes.filter(i => i.walletId === wallet.id);
        const totalExpenses = walletExpenses.reduce((sum, e) => sum + e.amount, 0);
        const totalIncomes = walletIncomes.reduce((sum, i) => sum + i.amount, 0);
        return (wallet.initialBalance || 0) + totalIncomes - totalExpenses;
      });
      
      const totalBalance = calculatedWallets.reduce((sum: number, balance: number) => sum + balance, 0);
      const pendingTasksCount = tasks.filter((t: any) => t.status === "pending").length;
      
      // Calculate expense trend (mock calculation)
      const thisMonthExpenses = expenses.filter((e: any) => {
        const date = new Date(e.date);
        const now = new Date();
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      }).reduce((sum: number, e: any) => sum + e.amount, 0);

      setStats({
        balance: totalBalance,
        pendingTasks: pendingTasksCount,
        healthRecords: healthRecords.length,
        upcomingEvents: 5, // Mock
        expenseChange: -12, // Mock percentage
      });
      
      // Set recent expenses and upcoming tasks
      setRecentExpenses(expenses.slice(0, 5));
      setUpcomingTasks(tasks.filter((t: any) => t.status === "pending").slice(0, 5));
    } catch (error: any) {
      console.error("Failed to load dashboard:", error);
      // Show error message to user
      setStats({
        balance: 0,
        pendingTasks: 0,
        healthRecords: 0,
        upcomingEvents: 0,
        expenseChange: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = async () => {
    try {
      if (!user?.id) return;
      const userNotifications = await apiService.getNotifications(user.id);
      setNotifications(userNotifications.filter((n: any) => !n.read));
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const generateNotifications = async () => {
    try {
      if (!user?.familyId) return;
      await apiService.generateUpcomingNotifications(user.familyId);
      loadNotifications();
    } catch (error) {
      console.error('Failed to generate notifications:', error);
    }
  };

  const dismissNotification = async (notificationId: string) => {
    try {
      await apiService.markNotificationRead(notificationId);
      setNotifications(notifications.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Failed to dismiss notification:', error);
    }
  };

  const statCards = [
    {
      title: "Family Balance",
      value: `₹${stats.balance.toFixed(2)}`,
      description: "Total across all wallets",
      icon: DollarSign,
      color: "text-primary",
      bgColor: "bg-primary/10",
      trend: stats.expenseChange,
    },
    {
      title: "Pending Tasks",
      value: stats.pendingTasks,
      description: "Tasks to complete",
      icon: CheckSquare,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "Health Records",
      value: stats.healthRecords,
      description: "Total records",
      icon: Heart,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
    {
      title: "Upcoming Events",
      value: stats.upcomingEvents,
      description: "Next 7 days",
      icon: CalendarIcon,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your family today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, index) => (
          <Card
            key={index}
            className="hover:shadow-medium transition-shadow cursor-pointer"
            onClick={() => {
              if (index === 0) navigate("/finance");
              if (index === 1) navigate("/tasks");
              if (index === 2) navigate("/health");
              if (index === 3) navigate("/calendar");
            }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                {card.description}
                {card.trend !== undefined && (
                  <span className={`flex items-center ${card.trend < 0 ? 'text-success' : 'text-destructive'}`}>
                    {card.trend < 0 ? (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    )}
                    {Math.abs(card.trend)}%
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks to get you started</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => navigate("/finance")}>
            <Plus className="h-5 w-5" />
            Add Expense
          </Button>
          <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => navigate("/tasks")}>
            <Plus className="h-5 w-5" />
            Create Task
          </Button>
          <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => navigate("/health")}>
            <Plus className="h-5 w-5" />
            Log Health Data
          </Button>
          <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => navigate("/documents")}>
            <Plus className="h-5 w-5" />
            Upload Document
          </Button>
        </CardContent>
      </Card>

      {/* Notifications */}
      {notifications.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-orange-600" />
              Notifications ({notifications.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {notifications.slice(0, 3).map((notification) => (
              <div key={notification.id} className="flex items-start justify-between p-3 bg-white rounded-lg border">
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{notification.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                </div>
                <div className="flex gap-2">
                  {notification.actionUrl && (
                    <Button size="sm" variant="outline" onClick={() => navigate(notification.actionUrl)}>
                      View
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => dismissNotification(notification.id)}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
            {notifications.length > 3 && (
              <p className="text-xs text-muted-foreground text-center">
                +{notifications.length - 3} more notifications
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Expenses</CardTitle>
            <CardDescription>Last 5 transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {recentExpenses.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-8">
                No expenses yet. Add your first expense to get started!
              </div>
            ) : (
              <div className="space-y-3">
                {recentExpenses.map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{expense.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(expense.date).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-destructive">-₹{expense.amount}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Tasks</CardTitle>
            <CardDescription>Tasks due soon</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingTasks.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-8">
                No pending tasks. Create a task to assign to family members!
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{task.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                      </p>
                    </div>
                    <div className="text-xs px-2 py-1 rounded bg-orange-100 text-orange-800">
                      {task.points || 0} pts
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
