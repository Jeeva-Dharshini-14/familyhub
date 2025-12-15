import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiService } from "@/lib/apiService";
import { authUtils, hasPermission } from "@/lib/auth";
import { toast } from "@/hooks/use-toast";
import { Plus, CheckCircle2, Clock, Trophy, Star, Calendar, User, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const Tasks = () => {
  const user = authUtils.getAuth();
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [myPoints, setMyPoints] = useState(0);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignedTo: "",
    dueDate: new Date().toISOString().split("T")[0],
    points: "10",
  });

  const canApprove = hasPermission(user?.role || "guest", "approveTasks");

  useEffect(() => {
    loadTasksData();
  }, []);

  const loadTasksData = async () => {
    try {
      if (!user?.familyId) return;

      const tasksData = await apiService.getTasks(user.familyId);
      setTasks(tasksData);
      
      const membersData = await apiService.getMembers(user.familyId);
      setMembers(membersData);

      // Find current member by email or memberId
      const currentMember = membersData.find(m => m.email === user?.email) || membersData.find(m => m.id === user?.memberId);
      if (currentMember) {
        console.log('Current member points:', currentMember.points);
        setMyPoints(currentMember?.points || 0);
      }
    } catch (error: any) {
      console.error("Failed to load tasks:", error);
      toast({
        title: "Loading Error",
        description: error.message || "Failed to load tasks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async () => {
    try {
      if (!formData.title || !formData.assignedTo) {
        toast({
          title: "Missing fields",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      await apiService.addTask({
        familyId: user?.familyId,
        title: formData.title,
        description: formData.description,
        assignedTo: formData.assignedTo,
        assignedBy: user?.memberId,
        dueDate: formData.dueDate,
        points: parseInt(formData.points),
        status: "pending",
      });

      toast({
        title: "Task created",
        description: "Task has been assigned successfully",
      });

      setDialogOpen(false);
      setFormData({
        title: "",
        description: "",
        assignedTo: "",
        dueDate: new Date().toISOString().split("T")[0],
        points: "10",
      });
      
      await loadTasksData();
    } catch (error: any) {
      toast({
        title: "Failed to create task",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      console.log('Completing task:', taskId);
      
      const result = await apiService.updateTask(taskId, {
        status: "completed",
        completedAt: new Date().toISOString(),
      });
      
      console.log('Task update result:', result);

      toast({
        title: "Task completed!",
        description: "Waiting for approval",
      });

      await loadTasksData();
    } catch (error: any) {
      console.error('Error completing task:', error);
      toast({
        title: "Failed to complete task",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleApproveTask = async (taskId: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) throw new Error("Task not found");
      
      // Update task status
      await apiService.updateTask(taskId, {
        status: "approved",
        approvedAt: new Date().toISOString(),
        approvedBy: user?.memberId,
      });
      
      // Award points to the member
      const assignedMember = members.find(m => m.id === task.assignedTo);
      if (assignedMember) {
        const currentPoints = assignedMember.points || 0;
        const newPoints = currentPoints + task.points;
        console.log(`Awarding ${task.points} points to ${assignedMember.name}. Current: ${currentPoints}, New: ${newPoints}`);
        
        await apiService.updateMember(assignedMember.id, {
          points: newPoints
        });
      }

      toast({
        title: "Task approved!",
        description: `${task.points} points awarded to ${assignedMember?.name}`,
      });

      await loadTasksData();
    } catch (error: any) {
      toast({
        title: "Failed to approve task",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await apiService.deleteTask(taskId);
      toast({
        title: "Task deleted",
        description: "Task has been removed",
      });
      await loadTasksData();
    } catch (error: any) {
      toast({
        title: "Failed to delete task",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Debug: Log user and task info
  console.log('Current user:', { memberId: user?.memberId, name: user?.name, familyId: user?.familyId });
  console.log('All tasks:', tasks.map(t => ({ id: t.id, title: t.title, assignedTo: t.assignedTo, status: t.status })));
  console.log('All members:', members.map(m => ({ id: m.id, name: m.name, email: m.email })));
  
  // Try to find current member by email if memberId doesn't match
  const currentMember = members.find(m => m.email === user?.email) || members.find(m => m.id === user?.memberId);
  const actualMemberId = currentMember?.id || user?.memberId;
  
  console.log('Found member:', currentMember, 'Using memberId:', actualMemberId);
  
  const myTasks = tasks.filter(t => t.assignedTo === actualMemberId);
  const familyTasks = tasks.filter(t => t.assignedTo !== actualMemberId);
  const pendingApproval = tasks.filter(t => t.status === "completed");
  
  console.log('My tasks:', myTasks.length, 'Family tasks:', familyTasks.length);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks & Rewards</h1>
          <p className="text-muted-foreground">Manage family tasks and earn rewards</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (open && members.length > 0 && !formData.assignedTo) {
            setFormData(prev => ({ ...prev, assignedTo: user?.memberId || members[0].id }));
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
              <Plus className="mr-2 h-4 w-4" />
              Create Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
              <DialogDescription>Assign a task to a family member</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Task Title</Label>
                <Input
                  id="title"
                  placeholder="Clean your room"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  placeholder="Additional details..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignedTo">Assign To</Label>
                <Select value={formData.assignedTo} onValueChange={(val) => setFormData({ ...formData, assignedTo: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select member" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name} ({member.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="points">Points Reward</Label>
                  <Input
                    id="points"
                    type="number"
                    value={formData.points}
                    onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddTask}>Create Task</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Points Card */}
      <Card className="relative overflow-hidden border-accent/20 bg-gradient-to-br from-accent/10 via-accent/5 to-transparent">
        <div className="absolute top-0 right-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-accent/10 blur-2xl" />
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-accent" />
            My Points
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <div className="text-4xl font-bold text-accent mb-2">{myPoints}</div>
          <p className="text-sm text-muted-foreground">Keep completing tasks to earn more!</p>
        </CardContent>
      </Card>

      {/* Tasks Tabs */}
      <Tabs defaultValue="my-tasks" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="my-tasks" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            My Tasks ({myTasks.length})
          </TabsTrigger>
          <TabsTrigger value="family-tasks" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Family Tasks ({familyTasks.length})
          </TabsTrigger>
          {canApprove && (
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending ({pendingApproval.length})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="my-tasks" className="space-y-4">
          {myTasks.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No tasks assigned</h3>
                  <p className="text-muted-foreground mb-4">You don't have any tasks assigned to you yet.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {myTasks.map((task) => (
                <Card key={task.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{task.title}</h3>
                          <Badge variant={
                            task.status === "pending" ? "secondary" : 
                            task.status === "completed" ? "outline" : "default"
                          }>
                            {task.status === "pending" && (
                              <>
                                <Clock className="mr-1 h-3 w-3" />
                                Pending
                              </>
                            )}
                            {task.status === "completed" && "Pending Approval"}
                            {task.status === "approved" && (
                              <>
                                <CheckCircle2 className="mr-1 h-3 w-3" />
                                Approved
                              </>
                            )}
                          </Badge>
                        </div>
                        {task.description && (
                          <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Trophy className="h-4 w-4" />
                            {task.points} points
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 min-w-fit">
                        <div className="flex gap-2">
                          {task.status === "pending" && (
                            <Button
                              size="sm"
                              onClick={() => handleCompleteTask(task.id)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Mark Complete
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        {task.status === "completed" && (
                          <Badge variant="outline" className="text-orange-600 border-orange-600">
                            <Clock className="mr-1 h-3 w-3" />
                            Awaiting Approval
                          </Badge>
                        )}
                        {task.status === "approved" && (
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Completed ✨
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="family-tasks" className="space-y-4">
          {familyTasks.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No family tasks</h3>
                  <p className="text-muted-foreground mb-4">No tasks assigned to other family members.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {familyTasks.map((task) => {
                const assignee = members.find(m => m.id === task.assignedTo);
                return (
                  <Card key={task.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{task.title}</h3>
                            <Badge variant="outline">
                              {assignee?.name || "Unknown"}
                            </Badge>
                            <Badge variant={
                              task.status === "pending" ? "secondary" : 
                              task.status === "completed" ? "outline" : "default"
                            }>
                              {task.status}
                            </Badge>
                          </div>
                          {task.description && (
                            <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Trophy className="h-4 w-4" />
                              {task.points} points
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {canApprove && (
          <TabsContent value="pending" className="space-y-4">
            {pendingApproval.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No pending approvals</h3>
                    <p className="text-muted-foreground mb-4">All completed tasks have been reviewed.</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {pendingApproval.map((task) => {
                  const assignee = members.find(m => m.id === task.assignedTo);
                  return (
                    <Card key={task.id} className="hover:shadow-md transition-shadow border-orange-200">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{task.title}</h3>
                              <Badge variant="outline">
                                By: {assignee?.name || "Unknown"}
                              </Badge>
                            </div>
                            {task.description && (
                              <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                Completed: {new Date(task.completedAt).toLocaleDateString()}
                              </div>
                              <div className="flex items-center gap-1">
                                <Trophy className="h-4 w-4" />
                                {task.points} points
                              </div>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleApproveTask(task.id)}
                            className="ml-4 bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Approve
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default Tasks;