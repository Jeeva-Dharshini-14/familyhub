import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Settings as SettingsIcon, Users, Bell, Lock, Palette, Edit } from "lucide-react";
import { authUtils } from "@/lib/auth";
import { apiService } from "@/lib/apiService";
import { toast } from "@/hooks/use-toast";
import { ManageMembers } from "@/components/ManageMembers";

const Settings = () => {
  const user = authUtils.getAuth();
  const [familyName, setFamilyName] = useState("");
  const [editFamilyName, setEditFamilyName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [notificationsDialogOpen, setNotificationsDialogOpen] = useState(false);
  const [securityDialogOpen, setSecurityDialogOpen] = useState(false);
  
  // Notification preferences
  const [notificationPrefs, setNotificationPrefs] = useState({
    taskReminders: true,
    expenseAlerts: true,
    familyUpdates: true,
    calendarEvents: true,
    emailNotifications: false,
  });
  
  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: true,
    loginAlerts: true,
  });

  useEffect(() => {
    loadFamilyData();
  }, []);

  const loadFamilyData = async () => {
    try {
      if (!user?.familyId) return;
      const family = await apiService.getFamily(user.familyId);
      setFamilyName(family?.name || "");
    } catch (error: any) {
      console.error("Failed to load family data:", error);
    }
  };

  const handleUpdateFamilyName = async () => {
    try {
      if (!editFamilyName.trim()) {
        toast({
          title: "Invalid name",
          description: "Family name cannot be empty",
          variant: "destructive",
        });
        return;
      }

      await apiService.updateFamily(user?.familyId, { name: editFamilyName });
      setFamilyName(editFamilyName);
      setDialogOpen(false);
      
      toast({
        title: "Family name updated",
        description: "Your family name has been updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Failed to update family name",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your family hub preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Family Information</CardTitle>
          <CardDescription>Current family details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between items-center py-2">
            <span className="text-muted-foreground">Family Name</span>
            <div className="flex items-center gap-2">
              <span className="font-medium">{familyName || "Loading..."}</span>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-8 w-8"
                    onClick={() => setEditFamilyName(familyName)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Family Name</DialogTitle>
                    <DialogDescription>Update your family's display name</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="familyName">Family Name</Label>
                      <Input
                        id="familyName"
                        value={editFamilyName}
                        onChange={(e) => setEditFamilyName(e.target.value)}
                        placeholder="Smith Family"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleUpdateFamilyName}>
                      Save Changes
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">Your Role</span>
            <span className="font-medium capitalize">{user?.role}</span>
          </div>
        </CardContent>
      </Card>

      {/* Manage Members Component */}
      <ManageMembers />

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="hover:shadow-medium transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Notifications</CardTitle>
                <CardDescription className="mt-1">Configure notification preferences</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" onClick={() => setNotificationsDialogOpen(true)}>
              Configure
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-medium transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Privacy & Security</CardTitle>
                <CardDescription className="mt-1">Security settings and data privacy</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" onClick={() => setSecurityDialogOpen(true)}>
              Review Settings
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Notifications Dialog */}
      <Dialog open={notificationsDialogOpen} onOpenChange={setNotificationsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notification Preferences</DialogTitle>
            <DialogDescription>Configure how you receive notifications</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Task Reminders</Label>
                <p className="text-sm text-muted-foreground">Get notified about upcoming tasks</p>
              </div>
              <Switch 
                checked={notificationPrefs.taskReminders} 
                onCheckedChange={(checked) => setNotificationPrefs(prev => ({ ...prev, taskReminders: checked }))} 
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Expense Alerts</Label>
                <p className="text-sm text-muted-foreground">Alerts for new expenses and budgets</p>
              </div>
              <Switch 
                checked={notificationPrefs.expenseAlerts} 
                onCheckedChange={(checked) => setNotificationPrefs(prev => ({ ...prev, expenseAlerts: checked }))} 
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Family Updates</Label>
                <p className="text-sm text-muted-foreground">Updates from family members</p>
              </div>
              <Switch 
                checked={notificationPrefs.familyUpdates} 
                onCheckedChange={(checked) => setNotificationPrefs(prev => ({ ...prev, familyUpdates: checked }))} 
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Calendar Events</Label>
                <p className="text-sm text-muted-foreground">Reminders for upcoming events</p>
              </div>
              <Switch 
                checked={notificationPrefs.calendarEvents} 
                onCheckedChange={(checked) => setNotificationPrefs(prev => ({ ...prev, calendarEvents: checked }))} 
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive updates via email</p>
              </div>
              <Switch 
                checked={notificationPrefs.emailNotifications} 
                onCheckedChange={(checked) => setNotificationPrefs(prev => ({ ...prev, emailNotifications: checked }))} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNotificationsDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              setNotificationsDialogOpen(false);
              toast({ title: "Preferences saved", description: "Notification settings updated" });
            }}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Security Dialog */}
      <Dialog open={securityDialogOpen} onOpenChange={setSecurityDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Privacy & Security</DialogTitle>
            <DialogDescription>Manage your security settings</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">Add extra security to your account</p>
              </div>
              <Switch 
                checked={securitySettings.twoFactorAuth} 
                onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, twoFactorAuth: checked }))} 
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Session Timeout</Label>
                <p className="text-sm text-muted-foreground">Auto logout after inactivity</p>
              </div>
              <Switch 
                checked={securitySettings.sessionTimeout} 
                onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: checked }))} 
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Login Alerts</Label>
                <p className="text-sm text-muted-foreground">Get notified of new logins</p>
              </div>
              <Switch 
                checked={securitySettings.loginAlerts} 
                onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, loginAlerts: checked }))} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSecurityDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              setSecurityDialogOpen(false);
              toast({ title: "Settings saved", description: "Security settings updated" });
            }}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;
